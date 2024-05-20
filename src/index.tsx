import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/hubs";
import { getAddress } from "viem";
import { Box, Heading, Text, Image, VStack, vars } from "./ui";

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: "NEYNAR_FROG_FM" }),
  ui: { vars },
});

app.frame("/", (c) => {
  const { req } = c;
  const params = new URLSearchParams(req.raw.url.slice(c.req.raw.url.indexOf("?")));
  return c.res({
    action: "/submit",
    image: (
      <Box
        height="100%"
        alignVertical="center"
        alignHorizontal="center"
      >
        <VStack gap="16" alignHorizontal="center">
          <Image src="/icon.png" width="128" />
          <Heading size="32" weight="900" style="margin-top: 20px;">
            Item To Sell
          </Heading>
        </VStack>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Price" />,
      <Button.Transaction target="/mint">Purchase</Button.Transaction>,
    ],
  });
});

app.frame("/submit", (c) => {
  const { buttonValue } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Selected: {buttonValue}
      </div>
    ),
  });
});



// app.transaction("/buy", (c) => {
//   const { address } = c;
//   // Send transaction response.
//   return c.contract({
//     abi: ,
//     chainId: "eip155:84532",
//     to: "",
//     functionName: "buy",
//     args: [getAddress(address)],
//   });
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
