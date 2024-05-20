import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/hubs";
import { getAddress } from "viem";
import { Box, Heading, Text, Image, VStack, HStack, vars } from "./ui";
import { fetchNft } from "./services/opensea";

type State = {
  chain: string;
  contract: string;
  tokenId: number;
}

export const app = new Frog<{ State: State }>({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: "NEYNAR_FROG_FM" }),
  initialState: { chain: "", contract: "", tokenId: 0 },
  ui: { vars },
});


app.frame("/", async (c) => {
  const state = c.deriveState()

  return c.res({
    image: (
      <Box
        height="100%"
        alignVertical="center"
        alignHorizontal="center"
      >
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Please enter the Opensea URL of the NFT you want to link below
        </div>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Opensea URL" />,
      <Button action="/item">Generate</Button>,
    ],
  });
})

app.frame("/item", async (c) => {
  const { req } = c;

  let chain = '';
  let contract = '';
  let tokenId = '';

  // Given via /
  const inputUrl = c.frameData?.inputText

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
      )
    })
  }

  if (urlParams?.length > 5 && urlParams?.includes("?contract")) {
    // opensea api call to get the nft data
    const params = new URLSearchParams(urlParams);
    chain = params.get('chain') || '';
    contract = params.get('contract') || '';
    tokenId = params.get('tokenId') || '';
  }

  // TODO: handle error if chain, contract, or tokenId is not provided
  if (!chain || !contract || !tokenId) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Invalid Data2
        </div>
      )
    })
  }

  const nftData = await fetchNft({ chain, contract, tokenId: Number(tokenId) });

  return c.res({
    action: "/submit",
    image: (
      <Box
        height="100%"
        alignVertical="center"
        alignHorizontal="center"
      >
        <HStack>
          <Image src="/icon.png" width="128" />
          <VStack>

            <Heading size="32" weight="900" style="margin-top: 20px;">
              {nftData.title || 'ITEM TITLE'}
            </Heading>
            <Text>
              {nftData.ownerAddress || '0x123'}
            </Text>

            <VStack gap="4">
              <Text>Current price</Text>
              <HStack gap="4">
                <Text>{nftData.priceEth || '0.0001'} ETH</Text>
                <Text>${nftData.priceUsd || '10.00'}</Text>
              </HStack>
            </VStack>
          </VStack>
        </HStack>

      </Box>
    ),
    intents: [
      // <TextInput placeholder="Price" />,
      // <Button.Transaction target="/mint">Purchase</Button.Transaction>,
      <Button.Transaction target="/purchase">Buy now</Button.Transaction>,
    ],
  });
});

app.frame("/purchase", (c) => {
  const { buttonValue } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Purchased: {buttonValue}
      </div>
    ),
  });
});


// TODO: enable stage 2
// app.transaction("/purchase", (c) => {
//   const { address } = c;

//   return c.res({
//     image: (
//       <div style={{ color: "white", display: "flex", fontSize: 60 }}>
//         Purchased: {address}
//       </div>
//     ),
//   }
//   )
// })
// Send transaction response.
// return c.contract({
//   abi: ,
//   chainId: "eip155:84532",
//   to: "",
//   functionName: "buy",
//   args: [getAddress(address)],
// });


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
