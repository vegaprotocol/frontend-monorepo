import { AssetStatus } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateDepositPage = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override?: PartialDeep<any>
) => {
  const defaultResult = {
    assetsConnection: {
      edges: [
        {
          node: {
            id: 'asset-0',
            symbol: 'AST0',
            name: 'Asset 0',
            decimals: 5,
            status: AssetStatus.STATUS_ENABLED,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x5E4b9aDA947130Fc320a144cd22bC1641e5c9d81',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'asset-1',
            symbol: 'AST1',
            name: 'Asset 1',
            decimals: 5,
            status: AssetStatus.STATUS_ENABLED,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d81',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'asset-2',
            symbol: 'AST2',
            name: 'Asset 2',
            decimals: 5,
            status: AssetStatus.STATUS_PENDING_LISTING,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d82',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'asset-3',
            symbol: 'AST3',
            name: 'Asset 3',
            decimals: 5,
            status: AssetStatus.STATUS_PROPOSED,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d83',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
        {
          node: {
            id: 'asset-4',
            symbol: 'AST4',
            name: 'Asset 4',
            decimals: 5,
            status: AssetStatus.STATUS_REJECTED,
            source: {
              __typename: 'ERC20',
              contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d84',
            },
            __typename: 'Asset',
          },
          __typename: 'AssetEdge',
        },
      ],
      __typename: 'AssetsConnection',
    },
  };

  return merge(defaultResult, override);
};
