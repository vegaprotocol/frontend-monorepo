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
  [N in Networks]: { [chainId: number]: string };
} = {
  [Networks.DEVNET]: {
    11155111: '0x6EA5BdbF96DcCbADb094A724a5f971C56B328c85',
    421614: '0xF4cE55013ab95bDc7cC4cA5D5678d3f2db338180',
  },
  [Networks.STAGNET1]: {
    11155111: '0xf041838F53f06C9B93de0aa81786c14797641D5D',
    421614: '0x425557997Cc49efde38156Fa63201EC54545436f',
  },
  [Networks.TESTNET]: {
    11155111: '0x8064d5F9A2ef89886b2d474B3F1Ad0edB8b62F3F',
    421614: '0xacF67bF871309C3CB0094A86570B12c4c861d616',
  },
  [Networks.MAINNET_MIRROR]: {
    11155111: '0x3C27006182f0C1aEE7F7F028EFeb00a310325b28',
    421614: '0x7B01251DE0f7ea0D17D86d7D1b3afdDA40f2457C',
  },
  [Networks.VALIDATORS_TESTNET]: {
    11155111: '0x3E0878162A4D5c2F24B64762B5B57158f5d664B8',
    421614: '0x42a61eBf24dA118BFC32703640F6A793957936BD',
  },
  [Networks.CUSTOM]: { 11155111: '', 421614: '' },
  [Networks.MAINNET]: {
    1: '0xA226E2A13e07e750EfBD2E5839C5c3Be80fE7D4d',
    42161: '0xCc006887FE2bfABB535030b3a9877Bb8C1e35201',
  },
};
