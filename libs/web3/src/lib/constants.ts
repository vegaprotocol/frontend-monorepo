import { Networks } from '@vegaprotocol/environment';

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
  [ETHEREUM_SEPOLIA_CHAIN_ID]: 'Ethereum (Sepolia)',
  [ETHEREUM_CHAIN_ID]: 'Ethereum',
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
    'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
  [ETHEREUM_SEPOLIA_CHAIN_ID]:
    'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',

  [ARBITRUM_CHAIN_ID]:
    'https://arbitrum-mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
  [ARBITRUM_SEPOLIA_CHAIN_ID]:
    'https://arbitrum-sepolia-archival.rpc.grove.city/v1/af6a2d529a11f8158bc8ca2a',
};

export const ERR_WRONG_CHAIN = new Error('wrong chain');
export const ERR_CHAIN_NOT_SUPPORTED = new Error('chain not supported');

export const ASSET_POOL_ADDRESSES: {
  [N in Networks]: { [id: number]: string };
} = {
  [Networks.DEVNET]: {
    [ETHEREUM_SEPOLIA_CHAIN_ID]: '0x6EA5BdbF96DcCbADb094A724a5f971C56B328c85',
    [ARBITRUM_SEPOLIA_CHAIN_ID]: '0xF4cE55013ab95bDc7cC4cA5D5678d3f2db338180',
  },
  [Networks.STAGNET1]: {
    [ETHEREUM_SEPOLIA_CHAIN_ID]: '0xf041838F53f06C9B93de0aa81786c14797641D5D',
    [ARBITRUM_SEPOLIA_CHAIN_ID]: '0x425557997Cc49efde38156Fa63201EC54545436f',
  },
  [Networks.TESTNET]: {
    [ETHEREUM_SEPOLIA_CHAIN_ID]: '0x8064d5F9A2ef89886b2d474B3F1Ad0edB8b62F3F',
    [ARBITRUM_SEPOLIA_CHAIN_ID]: '0xacF67bF871309C3CB0094A86570B12c4c861d616',
  },
  [Networks.MAINNET_MIRROR]: {
    [ETHEREUM_SEPOLIA_CHAIN_ID]: '0x3C27006182f0C1aEE7F7F028EFeb00a310325b28',
    [ARBITRUM_SEPOLIA_CHAIN_ID]: '0x7B01251DE0f7ea0D17D86d7D1b3afdDA40f2457C',
  },
  [Networks.VALIDATORS_TESTNET]: {
    [ETHEREUM_SEPOLIA_CHAIN_ID]: '0x3E0878162A4D5c2F24B64762B5B57158f5d664B8',
    [ARBITRUM_SEPOLIA_CHAIN_ID]: '0x42a61eBf24dA118BFC32703640F6A793957936BD',
  },
  [Networks.CUSTOM]: {
    [ETHEREUM_SEPOLIA_CHAIN_ID]: '',
    [ARBITRUM_SEPOLIA_CHAIN_ID]: '',
  },
  [Networks.MAINNET]: {
    [ETHEREUM_CHAIN_ID]: '0xA226E2A13e07e750EfBD2E5839C5c3Be80fE7D4d',
    [ARBITRUM_CHAIN_ID]: '0xCc006887FE2bfABB535030b3a9877Bb8C1e35201',
  },
};
