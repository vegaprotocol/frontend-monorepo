export const ETHEREUM_CHAIN_ID = 1;
export const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
export const ARBITRUM_CHAIN_ID = 42161;
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export const SUPPORTED_CHAINS = [
  ETHEREUM_CHAIN_ID,
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
  ARBITRUM_SEPOLIA_CHAIN_ID,
] as const;

export type ChainId = typeof SUPPORTED_CHAINS[number];

export const ChainIdMap: {
  [id: number]: string;
} = {
  [ETHEREUM_SEPOLIA_CHAIN_ID]: 'Sepolia',
  [ETHEREUM_CHAIN_ID]: 'Mainnet',
  [ARBITRUM_CHAIN_ID]: 'Arbitrum',
  [ARBITRUM_SEPOLIA_CHAIN_ID]: 'Arbitrum (Sepolia)',
};

export const getChainName = (chainId: number | null | undefined) => {
  const name = chainId ? ChainIdMap[chainId] : undefined;
  return name || 'Unknown';
};

/**
 * WalletConnect project id
 * https://cloud.walletconnect.com/sign-in
 */
export const WALLETCONNECT_PROJECT_ID =
  process.env['NX_WALLETCONNECT_PROJECT_ID'] || '';

export const ETHEREUM_PROVIDER_URL =
  process.env['NX_ETHEREUM_PROVIDER_URL'] || '';
