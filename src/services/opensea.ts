export const fetchNft = async ({
  chain = "base-sepolia",
  contract,
  tokenId,
}: {
  chain?: string;
  contract: string;
  tokenId: number;
}) => {
  const title = "";
  const description = "";
  const ownerAddress = "";
  const priceEth = 0;
  const priceUsd = 0;
  const saleEndsAt = new Date();
  const canOffer = false;
  return { title, description, priceEth, priceUsd, saleEndsAt, canOffer, ownerAddress };
};

export const fetchNftListing = async () => {
  return [];
}