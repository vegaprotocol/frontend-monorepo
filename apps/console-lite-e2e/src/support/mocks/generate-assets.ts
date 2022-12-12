import merge from 'lodash/merge';
import type { AssetsQuery } from '@vegaprotocol/assets';
import * as Types from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const generateAssets = (override?: PartialDeep<AssetsQuery>) => {
  const defaultAssets: AssetsQuery = {
    assetsConnection: {
      edges: [
        {
          node: {
            id: 'asset-id',
            symbol: 'tEURO',
            decimals: 5,
            name: 'Euro',
            source: {
              __typename: 'ERC20',
              contractAddress: '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4',
              lifetimeLimit: '1',
              withdrawThreshold: '2',
            },
            quantum: '',
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
            __typename: 'Asset',
          },
        },
        {
          node: {
            id: 'asset-id-2',
            symbol: 'tDAI',
            decimals: 5,
            name: 'DAI',
            source: {
              __typename: 'ERC20',
              contractAddress: '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4',
              lifetimeLimit: '1',
              withdrawThreshold: '2',
            },
            quantum: '',
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
            __typename: 'Asset',
          },
        },
        {
          node: {
            id: 'asset-0',
            symbol: 'AST0',
            decimals: 5,
            name: 'Asto',
            source: {
              __typename: 'BuiltinAsset',
              maxFaucetAmountMint: '3',
            },
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
            infrastructureFeeAccount: {
              balance: '0',
              __typename: 'AccountBalance',
            },
            globalRewardPoolAccount: null,
            takerFeeRewardAccount: null,
            makerFeeRewardAccount: null,
            lpFeeRewardAccount: null,
            marketProposerRewardAccount: null,
            __typename: 'Asset',
          },
        },
      ],
    },
  };
  return merge(defaultAssets, override);
};
