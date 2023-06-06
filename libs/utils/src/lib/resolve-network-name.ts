const NETWORK_NAME_MAP = {
  '1': 'Ethereum Mainnet',
  '11155111': 'Sepolia test network',
};
export const resolveNetworkName = (chainId?: string) =>
  NETWORK_NAME_MAP[chainId || ''] || `(chainID: ${chainId})`;
