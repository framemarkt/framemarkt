import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/hubs";
import { getAddress } from "viem";
import { Box, Heading, Text, Image, VStack, HStack, vars } from "./ui";
import { fetchNft } from "./services/opensea";

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: "NEYNAR_FROG_FM" }),
  ui: { vars },
});

app.frame("/", async (c) => {
  const { req } = c;
  const urlParams = req.raw.url.slice(c.req.raw.url.indexOf("?"));
  if (!urlParams) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Invalid Data
        </div>
      )
    })
  }



  // opensea api call to get the nft data
  const params = new URLSearchParams(urlParams);
  const chain = params.get('chain');
  const contract = params.get('contract');
  const tokenId = params.get('tokenId');

  // TODO: handle error if chain, contract, or tokenId is not provided
  if (!chain || !contract || !tokenId) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Invalid Data
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
