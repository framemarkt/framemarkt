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
      const price = data.orders[0].current_price;
      priceEth = formatUnits(price, 18).toString();
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
  };
};

export const fetchNftListing = async () => {
  return [];
};
