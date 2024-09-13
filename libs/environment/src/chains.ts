import { Networks } from './types';

export const CHAIN_IDS: {
  [N in Networks]: string;
} = {
  [Networks.DEVNET]: '',
  [Networks.STAGNET1]: '',
  [Networks.TESTNET]: '',
  [Networks.MAINNET_MIRROR]: '',
  [Networks.VALIDATORS_TESTNET]: '',
  [Networks.CUSTOM]: '',
  [Networks.MAINNET]: 'nebula1',
};
