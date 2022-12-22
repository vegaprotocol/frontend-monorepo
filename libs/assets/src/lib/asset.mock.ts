import merge from 'lodash/merge';
import type { AssetFieldsFragment, AssetQuery } from './__generated__/Asset';
import * as Types from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const assetQuery = (override?: PartialDeep<AssetQuery>): AssetQuery => {
  const defaultAssets: AssetQuery = {
    assetsConnection: {
      edges: assetFields.map((node) => ({
        __typename: 'AssetEdge',
        node,
      })),
    },
  };
  return merge(defaultAssets, override);
};

const assetFields: AssetFieldsFragment[] = [
  {
    __typename: 'Asset',
    id: 'asset-id',
    symbol: 'tEURO',
    decimals: 5,
    name: 'Euro',
    source: {
      contractAddress: '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4',
      lifetimeLimit: '123000000',
      withdrawThreshold: '50',
      __typename: 'ERC20',
    },
    quantum: '1',
    status: Types.AssetStatus.STATUS_ENABLED,
    infrastructureFeeAccount: {
      balance: '1',
      __typename: 'AccountBalance',
    },
    globalRewardPoolAccount: {
      balance: '2',
      __typename: 'AccountBalance',
    },
    takerFeeRewardAccount: {
      balance: '3',
      __typename: 'AccountBalance',
    },
    makerFeeRewardAccount: {
      balance: '4',
      __typename: 'AccountBalance',
    },
    lpFeeRewardAccount: {
      balance: '5',
      __typename: 'AccountBalance',
    },
    marketProposerRewardAccount: {
      balance: '6',
      __typename: 'AccountBalance',
    },
  },
];
