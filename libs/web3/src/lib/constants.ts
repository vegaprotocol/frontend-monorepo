export const ChainIdMap: {
  [id: number]: string;
} = {
  11155111: 'Sepolia',
  1: 'Mainnet',
};

export const getChainName = (chainId: number | null | undefined) => {
  const name = chainId ? ChainIdMap[chainId] : undefined;
  return name || 'Unknown';
};
