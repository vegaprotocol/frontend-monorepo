import { Networks } from './types';

export const CHAIN_IDS: {
  [N in Networks]: string;
} = {
  [Networks.DEVNET]: 'vega-devnet1-202402161135',
  [Networks.STAGNET1]: 'vega-stagnet1-202307191148',
  [Networks.TESTNET]: 'vega-fairground-202305051805',
  [Networks.MAINNET_MIRROR]: 'vega-mainnet-mirror-202306231148',
  [Networks.VALIDATORS_TESTNET]: 'vega-testnet-0002-v4',
  [Networks.CUSTOM]: 'vega-stagnet1-202307191148',
  [Networks.MAINNET]: 'vega-mainnet-0011',
};
