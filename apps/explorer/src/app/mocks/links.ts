import { ExplorerEpochForBlockDocument } from '../components/links/block-link/__generated__/EpochByBlock';
import { ExplorerNodeNamesDocument } from '../routes/validators/__generated__/NodeNames';
import type { MockedResponse } from '@apollo/client/testing';
import { ExplorerMarketDocument } from '../components/links/market-link/__generated__/Market';
import { ExplorerNodeDocument } from '../components/links/node-link/__generated__/Node';
import { AssetMarketsDocument } from '../routes/assets/components/__generated__/Asset-Markets';

export const MockNodeNames: MockedResponse = {
  request: {
    query: ExplorerNodeNamesDocument,
  },
  result: { data: null },
};

export const MockExplorerEpochForBlock: MockedResponse = {
  request: {
    query: ExplorerEpochForBlockDocument,
    variables: {
      block: '1',
    },
  },
  result: { data: null },
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
  result: { data: { market: { id: '456' } } },
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

export const commonLinkMocks: MockedResponse[] = [
  MockNodeNames,
  MockExplorerEpochForBlock,
  MockExplorerMarket123,
  MockExplorerNode,
  MockAssetMarkets,
];
