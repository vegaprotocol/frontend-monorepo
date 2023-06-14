const NETWORK_NAME_MAP: Readonly<Record<string, string>> = {
  '1': 'Ethereum Mainnet',
  '11155111': 'Sepolia test network',
};
export const resolveNetworkName = (chainId?: string): string =>
  NETWORK_NAME_MAP[chainId || ''] || `(chainID: ${chainId})`;
