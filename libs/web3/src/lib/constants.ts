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

export const isSupportedChainId = (chainId: number): chainId is ChainId => {
  for (const supported of SUPPORTED_CHAINS) {
    if (supported === chainId) {
      return true;
    }
  }
  return false;
};

export const ChainIdMap: Record<ChainId, string> = {
  [ETHEREUM_SEPOLIA_CHAIN_ID]: 'Sepolia',
  [ETHEREUM_CHAIN_ID]: 'Mainnet',
  [ARBITRUM_CHAIN_ID]: 'Arbitrum',
  [ARBITRUM_SEPOLIA_CHAIN_ID]: 'Arbitrum (Sepolia)',
};

export const getChainName = (chainId: number | null | undefined) => {
  const name = chainId ? ChainIdMap[chainId as ChainId] : undefined;
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

/**
 * The chain's block default block explorer.
 */
export const BLOCK_EXPLORER_URL: Record<ChainId, string> = {
  [ETHEREUM_CHAIN_ID]: 'https://etherscan.io',
  [ETHEREUM_SEPOLIA_CHAIN_ID]: 'https://sepolia.etherscan.io',
  [ARBITRUM_CHAIN_ID]: 'https://arbiscan.io',
  [ARBITRUM_SEPOLIA_CHAIN_ID]: 'https://sepolia.arbiscan.io',
};

/**
 * The per chain RPC endpoint.
 */
export const TRANSPORTS: Record<ChainId, string | undefined> = {
  [ETHEREUM_CHAIN_ID]:
    'https://eth-mainnet.rpc.grove.city/v1/af6a2d529a11f8158bc8ca2a',
  [ETHEREUM_SEPOLIA_CHAIN_ID]:
    'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',

  // TODO: Change the RPCs below to the proper one, these are just a free plan for testing
  [ARBITRUM_CHAIN_ID]: 'https://arbitrum-one.rpc.grove.city/v1/11e60d54',
  [ARBITRUM_SEPOLIA_CHAIN_ID]:
    'https://arbitrum-sepolia-archival.rpc.grove.city/v1/11e60d54',
};

export const ERR_WRONG_CHAIN = new Error('wrong chain');
export const ERR_CHAIN_NOT_SUPPORTED = new Error('chain not supported');
