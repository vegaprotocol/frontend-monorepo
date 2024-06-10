// TODO: this is also stored in libs/web3, but including it in assets
// creates a circular dependency web3 -> assets -> web3

export const ETHEREUM_CHAIN_ID = '1';
export const ETHEREUM_SEPOLIA_CHAIN_ID = '11155111';
export const ARBITRUM_CHAIN_ID = '42161';
export const ARBITRUM_SEPOLIA_CHAIN_ID = '421614';

export const ChainIdMapShort: Record<string, string> = {
  [ETHEREUM_SEPOLIA_CHAIN_ID]: 'Eth (Sepolia)',
  [ETHEREUM_CHAIN_ID]: 'Eth',
  [ARBITRUM_CHAIN_ID]: 'Arb',
  [ARBITRUM_SEPOLIA_CHAIN_ID]: 'Arb (Sepolia)',
};
