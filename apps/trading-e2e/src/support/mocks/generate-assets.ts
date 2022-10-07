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
            quantum: '1',
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
              contractAddress: '0x26223f9C67871CFcEa329975f7BC0C9cB8FBDb9b',
            },
            quantum: '1',
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
            quantum: '1',
            status: Types.AssetStatus.STATUS_ENABLED,
          },
        },
        // NOTE: These assets ids and contract addresses are real assets on Sepolia, this is needed
        // because we don't currently mock our seplia infura provider. If we change network these will
        // need to be updated
        {
          node: {
            id: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
            symbol: 'tBTC',
            name: 'Sepolia tBTC',
            decimals: 5,
            status: Types.AssetStatus.STATUS_ENABLED,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x1d525fB145Af5c51766a89706C09fE07E6058D1D',
            },
            quantum: '1',
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
            symbol: 'tUSDC',
            name: 'Sepolia tUSDC',
            decimals: 5,
            status: Types.AssetStatus.STATUS_ENABLED,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d81',
            },
            quantum: '1',
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
      ],
    },
  };
  return merge(defaultAssets, override);
};
