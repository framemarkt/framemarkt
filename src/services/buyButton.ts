import { createPublicClient, getContract, http } from "viem";
import openseaAbi from "../abis/opensea";
import chains from "viem/chains";

export const createTransaction = (openseaAddress: `0x${string}`) => {
  const publicClient = createPublicClient({
    chain: chains.mainnet,
    transport: http(),
  });
  const contract = getContract({
    abi: openseaAbi,
    address: openseaAddress,
    client: publicClient,
  });
  contract.write.fulfillOrder([
    {
      parameters: {
        offerer: "",
        offer: [{}],
        consideration: [{}],
      },
    },
  ]);
};
