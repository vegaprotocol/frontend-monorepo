import merge from 'lodash/merge';
import type { AssetsQuery } from '@vegaprotocol/assets';
import { Schema as Types } from '@vegaprotocol/types';
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
            },
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
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
            },
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
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
            },
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
          },
        },
      ],
    },
  };
  return merge(defaultAssets, override);
};
