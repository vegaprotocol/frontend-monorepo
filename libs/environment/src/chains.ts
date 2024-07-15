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

export const ASSET_POOL_ADDRESSES: {
  [N in Networks]: string;
} = {
  [Networks.DEVNET]: '0x6EA5BdbF96DcCbADb094A724a5f971C56B328c85',
  [Networks.STAGNET1]: '0xf041838F53f06C9B93de0aa81786c14797641D5D',
  [Networks.TESTNET]: '0x8064d5F9A2ef89886b2d474B3F1Ad0edB8b62F3F',
  [Networks.MAINNET_MIRROR]: '0x3C27006182f0C1aEE7F7F028EFeb00a310325b28',
  [Networks.VALIDATORS_TESTNET]: '0x3E0878162A4D5c2F24B64762B5B57158f5d664B8',
  [Networks.CUSTOM]: '',
  [Networks.MAINNET]: '0xA226E2A13e07e750EfBD2E5839C5c3Be80fE7D4d',
};
