export const convertAddress = (address: string, pre = 5, post = 4, dot = 3) => {
  const dots = dot === 1 ? "." : dot === 2 ? ".." : "...";
  if (address.length <= pre + post + dot) return address;
  return `${address.substring(0, pre)}${dots}${address.substring(
    address.length,
    address.length - post
  )}`;
};
