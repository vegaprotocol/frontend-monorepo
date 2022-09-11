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
      ],
      __typename: 'AssetsConnection',
    },
  };

  return merge(defaultResult, override);
};
