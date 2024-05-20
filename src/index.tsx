import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { Box, Heading, Text, Image, VStack, HStack, vars } from "./ui";
import { fetchNft, fulfillOrder } from "./services/opensea";
import { convertAddress } from "./helpers";
import opensea from "./abis/opensea";

type State = {
  chain: string;
  contract: string;
  tokenId: number;
};

export const app = new Frog<{ State: State }>({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: "NEYNAR_FROG_FM" }),
  initialState: { chain: "", contract: "", tokenId: 0 },
  ui: { vars },
});

app.frame("/", async (c) => {
  const state = c.deriveState();

  return c.res({
    image: (
      <Box
        alignVertical="center"
        alignHorizontal="center"
        paddingLeft="12"
        paddingRight="12"
        paddingTop="56"
        paddingBottom="56"
      >
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Enter the Opensea URL of the NFT you want to link below
        </div>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Opensea URL" />,
      <Button action="/item">Generate</Button>,
    ],
  });
});

app.frame("/item", async (c) => {
  const { req } = c;

  let chain = "";
  let contract = "";
  let tokenId = "";

  // Given via /
  const inputUrl = c.frameData?.inputText;

  // TODO
  // Check that inputUrl is a valid format
  //  https://opensea.io/assets/ethereum/0x9a74559843f7721f69651eca916b780ef78bd060/5207
  if (inputUrl) {
    // format
    // https://opensea.io/assets/:chain/:contract/:tokenId
    const splitUrl = inputUrl.split("/");
    chain = splitUrl[4];
    contract = splitUrl[5];
    tokenId = splitUrl[6];
  }

  const urlParams = req.raw.url.slice(c.req.raw.url.indexOf("?"));
  if (urlParams?.length <= 5 && (inputUrl?.length ?? 0) <= 5) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Invalid Data
        </div>
      ),
      intents: [<Button action="/">Generate</Button>],
    });
  }

  if (
    urlParams?.length > 5 &&
    urlParams?.includes("contract=") &&
    urlParams?.includes("tokenId=") &&
    urlParams?.includes("chain=")
  ) {
    // opensea api call to get the nft data
    const params = new URLSearchParams(urlParams.replaceAll("amp;", ""));
    chain = params.get("chain") || "";
    contract = params.get("contract") || "";
    tokenId = params.get("tokenId") || "";
  }

  // TODO: handle error if chain, contract, or tokenId is not provided
  if (!chain || !contract || !tokenId) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Invalid Data2
        </div>
      ),
      intents: [<Button action="/">Generate</Button>],
    });
  }

  const nftData = await fetchNft({ chain, contract, tokenId: Number(tokenId) });

  return c.res({
    image: (
      <Box height="100%" alignVertical="center" alignHorizontal="center">
        <HStack gap="20" alignHorizontal="center" alignVertical="center">
          <Image src={nftData.image} height="192" />
          <VStack gap="24" alignVertical="center">
            <VStack>
              <Heading size="24" weight="900">
                {nftData.title || "ITEM TITLE"}
              </Heading>
              <Text color="gray900">
                Owned by{" "}
                {nftData.ownerAddress
                  ? convertAddress(nftData.ownerAddress)
                  : "0x123"}
              </Text>
            </VStack>

            <VStack gap="4">
              <Text color="gray900">Current price</Text>
              <HStack gap="8">
                <Text size="24" weight="900">
                  {nftData.priceEth || "0.0001"} ETH
                </Text>
                <Text color="gray900">${nftData.priceUsd || "150.00"}</Text>
              </HStack>
            </VStack>
          </VStack>
        </HStack>
      </Box>
    ),
    intents: [
      <Button action="/">Generate</Button>,
      <Button.Link
        href={`https://opensea.io/assets/${chain}/${contract}/${tokenId}`}
      >
        OpenSea
      </Button.Link>,
      <Button.Link
        href={`https://framemarkt.tre-dev.workers.dev/item?chain=${chain}&contract=${contract}&tokenId=${tokenId}`}
      >
        Share
      </Button.Link>,
      <Button.Transaction
        target={`/purchase?orderHash=${nftData.orderHash}&chain=${chain}`}
      >
        Buy now
      </Button.Transaction>,
    ],
  });
});

app.transaction("/purchase", async (c) => {
  const { address, req } = c;

  let orderHash: string = "";
  let chain: string = "";

  const urlParams = req.raw.url.slice(c.req.raw.url.indexOf("?"));
  console.log(urlParams);
  if (urlParams?.length < 2) {
    return c.error({
      message: "Invalid Data",
    });
  }

  if (urlParams?.length >= 2 && urlParams?.includes("?orderHash")) {
    // opensea api call to get the nft data
    const params = new URLSearchParams(urlParams.replaceAll("amp;", ""));
    chain = params.get("chain") || "";
    orderHash = params.get("orderHash") || "";
  }

  const {
    fulfillment_data: { transaction },
  } = await fulfillOrder(orderHash, chain, address);
  const chainId = `eip155:${transaction.chain}` as any;
  let rawFunc = transaction.function;
  if (rawFunc.indexOf("(") !== -1) {
    rawFunc = rawFunc.slice(0, rawFunc.indexOf("("));
  }

  return c.contract({
    abi: opensea,
    chainId,
    to: transaction.to as any,
    value: transaction.value as any,
    functionName: rawFunc as any,
    args: Object.values(transaction.input_data) as any,
  });
});

const isCloudflareWorker = typeof caches !== "undefined";
if (isCloudflareWorker) {
  // @ts-ignore
  const manifest = await import("__STATIC_CONTENT_MANIFEST");
  const serveStaticOptions = { manifest, root: "./" };
  app.use("/*", serveStatic(serveStaticOptions));
  devtools(app, { assetsPath: "/frog", serveStatic, serveStaticOptions });
} else {
  devtools(app, { serveStatic });
}

export default app;
