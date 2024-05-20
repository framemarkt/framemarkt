import axios from "axios";
import { OPENSEA_API_KEY } from "../config";
import { formatUnits } from "viem";

const openseaBaseUrl = "https://api.opensea.io/api/v2";

export const fetchNft = async ({}: {
  chain?: string;
  contract: string;
  tokenId: number;
}) => {
  const chain = "ethereum";
  const contractAddress = "0x7aada103f7852c7e7da61e100d6277a3fd199b58";
  const token_id = "696";

  const openseaendpoint = `${openseaBaseUrl}/orders/${chain}/seaport/listings?asset_contract_address=${contractAddress}&token_ids=${token_id}`;
  const nftEndpoint = `${openseaBaseUrl}/chain/${chain}/contract/${contractAddress}/nfts/${token_id}`;

  const headers = { "x-api-key": OPENSEA_API_KEY };

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

  try {
    const { data } = await axios.get(openseaendpoint, {
      headers,
    });

    const {
      data: { nft: nftData },
    } = await axios.get(nftEndpoint, {
      headers,
    });

    console.log(nftData);

    console.log(data);

    if (!data.orders || data.orders.length == 0) {
    } else {
      title = nftData.name;
      description = nftData.description;
      ownerAddress = nftData.owners[0].address;
      image = nftData.image_url;
      value = data.orders[0].current_price;
      priceEth = formatUnits(value as any, 18).toString();
      signature = data.orders[0].protocol_data.signature;
      parameters = data.orders[0].protocol_data.parameters;
      protocolAddress = data.orders[0].protocol_address;
    }
  } catch (err) {
    console.log(err);
  }

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
  };
};

export const fetchNftListing = async () => {
  return [];
};
