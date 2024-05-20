import axios from "axios";
import { OPENSEA_API_KEY } from "../config";
import { formatUnits } from "viem";

// const openseaBaseUrl = "https://testnets-api.opensea.io/api/v2";
const openseaBaseUrl = "https://api.opensea.io/api/v2";
const headers = { "x-api-key": OPENSEA_API_KEY };

export const fetchNft = async ({
  chain,
  contract,
  tokenId,
}: {
  chain?: string;
  contract: string;
  tokenId: number;
}) => {
  const openseaendpoint = `${openseaBaseUrl}/orders/${chain}/seaport/listings?asset_contract_address=${contract}&token_ids=${tokenId}`;
  const nftEndpoint = `${openseaBaseUrl}/chain/${chain}/contract/${contract}/nfts/${tokenId}`;

  let title = "";
  let description = "";
  let ownerAddress = "";
  let priceEth = "0";
  let priceUsd = 0;
  let saleEndsAt = new Date();
  let canOffer = false;
  let image = "";
  let parameters: any = null;
  let signature: `0x${string}` = "0x";
  let value: string = "0";
  let protocolAddress: `0x${string}` = "0x";
  let orderHash: `0x${string}` = "0x";

  try {
    const [orderResult, nftResult] = await Promise.all([
      axios.get(openseaendpoint, {
        headers,
      }),
      axios.get(nftEndpoint, {
        headers,
      }),
    ]);

    const { data: orderData } = orderResult;
    const { data: nftData } = nftResult;
    
    if (!orderData.orders || orderData.orders.length == 0) {
    } else {
      title = nftData.nft.name;
      description = nftData.nft.description;
      ownerAddress = nftData.nft.owners[0].address;
      image = nftData.nft.image_url;
      value = orderData.orders[0].current_price;
      priceEth = formatUnits(value as any, 18).toString();
      console.log(JSON.stringify(orderData.orders[0].protocol_data));
      signature = orderData.orders[0].protocol_data.signature;
      parameters = orderData.orders[0].protocol_data.parameters;
      protocolAddress = orderData.orders[0].protocol_address;
      orderHash = orderData.orders[0].order_hash;
    }
  } catch (err) {
    console.log(err);
  }

  console.log(
    JSON.stringify({
      title,
      image,
      description,
      priceEth,
      priceUsd,
      saleEndsAt,
      canOffer,
      ownerAddress,
      parameters,
      signature,
      value,
      protocolAddress,
    })
  );

  return {
    title,
    image,
    description,
    priceEth,
    priceUsd,
    saleEndsAt,
    canOffer,
    ownerAddress,
    parameters,
    signature,
    value,
    protocolAddress,
    orderHash,
  };
};

export async function fulfillOrder(
  hash: string,
  chain: string,
  address: string
) {
  const endpoint = `${openseaBaseUrl}/offers/fulfillment_data`;

  const { data } = await axios.post(
    endpoint,
    { offer: { hash, chain }, fulfiller: { address } },
    { headers }
  );

  return data as {
    protocol: string;
    fulfillment_data: {
      transaction: {
        function: string;
        chain: number;
        to: string;
        value: number;
        input_data: Record<string, any>;
      };
      orders: {
        parameters: {
          offerer: string;
          offer: {
            itemType: number;
            token: string;
            identifierOrCriteria: string;
            startAmount: string;
            endAmount: string;
          }[];
          consideration: {
            itemType: number;
            token: string;
            identifierOrCriteria: string;
            startAmount: string;
            endAmount: string;
            recipient: string;
          }[];
          startTime: string;
          endTime: string;
          orderType: number;
          zone: string;
          zoneHash: string;
          salt: string;
          conduitKey: string;
          totalOriginalConsiderationItems: number;
          counter: number;
        };
        signature: string;
      }[];
    };
  };
}

export const fetchNftListing = async () => {
  return [];
};
