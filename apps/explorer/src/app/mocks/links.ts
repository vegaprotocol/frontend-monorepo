import { ExplorerEpochForBlockDocument } from '../components/links/block-link/__generated__/EpochByBlock';
import { ExplorerNodeNamesDocument } from '../routes/validators/__generated__/NodeNames';
import type { MockedResponse } from '@apollo/client/testing';
import { ExplorerMarketDocument } from '../components/links/market-link/__generated__/Market';
import { ExplorerNodeDocument } from '../components/links/node-link/__generated__/Node';
import { AssetMarketsDocument } from '../routes/assets/components/__generated__/Asset-Markets';
import { AssetsDocument } from '@vegaprotocol/assets';
import { ExplorerEpochDocument } from '../components/epoch-overview/__generated__/Epoch';

export const MockNodeNames: MockedResponse = {
  request: {
    query: ExplorerNodeNamesDocument,
  },
  result: { data: null },
};
export const MockExplorerEpoch: MockedResponse = {
  request: {
    query: ExplorerEpochDocument,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      epoch: {
        id: '1',
        timestamps: {
          start: '2022-03-24T11:03:40.014303953Z',
          end: '2022-03-24T11:03:40.014303953Z',
          lastBlock: '1',
        },
      },
    },
  },
};

export const MockExplorerEpochForBlock: MockedResponse = {
  request: {
    query: ExplorerEpochForBlockDocument,
    variables: {
      block: '1',
    },
  },
  result: {
    data: {
      epoch: {
        id: '1',
        timestamps: {
          start: '2022-03-24T11:03:40.014303953Z',
          end: '2022-03-24T11:03:40.014303953Z',
          lastBlock: '1',
        },
      },
    },
  },
};

export const MockExplorerEpochForBlockBlank: MockedResponse = {
  request: {
    query: ExplorerEpochForBlockDocument,
    variables: {
      block: '',
    },
  },
  result: {
    data: {
      epoch: {
        id: '1',
        timestamps: {
          start: '2022-03-24T11:03:40.014303953Z',
          end: '2022-03-24T11:03:40.014303953Z',
          lastBlock: '1',
        },
      },
    },
  },
};

export const MockExplorerMarket123: MockedResponse = {
  request: {
    query: ExplorerMarketDocument,
    variables: {
      id: '123',
    },
  },
  result: { data: { market: { id: '123' } } },
};

export const MockExplorerMarket456: MockedResponse = {
  request: {
    query: ExplorerMarketDocument,
    variables: {
      id: '456',
    },
  },
  result: {
    data: {
      market: {
        id: '456',
        decimalPlaces: 5,
        positionDecimalPlaces: 2,
        state: 'irrelevant-test-data',
        tradableInstrument: {
          instrument: {
            name: 'test-label',
            product: {
              __typename: 'Future',
              quoteName: 'dai',
              settlementAsset: {
                decimals: 8,
              },
            },
          },
        },
      },
    },
  },
};

export const MockExplorerNode: MockedResponse = {
  request: {
    query: ExplorerNodeDocument,
    variables: {
      id: '123',
    },
  },
  result: { data: null },
};

export const MockAssetMarkets: MockedResponse = {
  request: {
    query: AssetMarketsDocument,
  },
  result: { data: null },
};

export const MockAsset: MockedResponse = {
  request: {
    query: AssetsDocument,
    variables: {
      assetId: 'asset1',
    },
  },
  result: { data: null },
};

export const commonLinkMocks: MockedResponse[] = [
  MockNodeNames,
  MockExplorerEpochForBlock,
  MockExplorerMarket123,
  MockExplorerNode,
  MockAssetMarkets,
  MockAsset,
  MockExplorerEpoch,
];
