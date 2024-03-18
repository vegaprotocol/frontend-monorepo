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

export const CONNECTOR_STORAGE_KEY = 'vega_ethereum_connector';
