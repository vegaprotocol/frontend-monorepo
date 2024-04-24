import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetDocument } from '@vegaprotocol/assets';
import { AssetsDocument } from '@vegaprotocol/assets';
import { AssetStatus } from '@vegaprotocol/types';

const A1: AssetFieldsFragment = {
  __typename: 'Asset',
  id: '123',
  name: 'A ONE',
  symbol: 'A1',
  decimals: 0,
  quantum: '',
  status: AssetStatus.STATUS_ENABLED,
  source: {
    __typename: 'BuiltinAsset',
    maxFaucetAmountMint: '',
  },
  globalInsuranceAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  networkTreasuryAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
};

const A2: AssetFieldsFragment = {
  __typename: 'Asset',
  id: '456',
  name: 'A TWO',
  symbol: 'A2',
  decimals: 0,
  quantum: '',
  status: AssetStatus.STATUS_ENABLED,
  source: {
    __typename: 'BuiltinAsset',
    maxFaucetAmountMint: '',
  },
  globalInsuranceAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  networkTreasuryAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
};

export const assetsList = [A1, A2];

export const mockAssetsList = {
  request: {
    query: AssetsDocument,
  },
  result: {
    data: {
      assetsConnection: {
        __typename: 'AssetsConnection',
        edges: [
          {
            __typename: 'AssetEdge',
            node: A1,
          },
          {
            __typename: 'AssetEdge',
            node: A2,
          },
        ],
      },
    },
  },
};

export const mockEmptyAssetsList = {
  request: {
    query: AssetsDocument,
  },
  result: { data: null },
};

export const mockAssetA1 = {
  request: {
    query: AssetDocument,
    variables: {
      assetId: '123',
    },
  },
  result: {
    data: {
      assetsConnection: {
        __typename: 'AssetsConnection',
        edges: [
          {
            __typename: 'AssetEdge',
            node: A1,
          },
        ],
      },
    },
  },
};
