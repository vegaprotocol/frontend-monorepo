import { ExplorerEpochForBlockDocument } from '../components/links/block-link/__generated__/EpochByBlock';
import { ExplorerNodeNamesDocument } from '../routes/validators/__generated__/NodeNames';
import type { MockedResponse } from '@apollo/client/testing';
import { ExplorerMarketDocument } from '../components/links/market-link/__generated__/Market';
import { ExplorerNodeDocument } from '../components/links/node-link/__generated__/Node';

export const NodeNamesMock: MockedResponse = {
  request: {
    query: ExplorerNodeNamesDocument,
  },
  result: { data: null },
};

export const ExplorerEpochForBlock: MockedResponse = {
  request: {
    query: ExplorerEpochForBlockDocument,
    variables: {
      block: '52987',
    },
  },
  result: { data: null },
};

export const ExplorerMarket123: MockedResponse = {
  request: {
    query: ExplorerMarketDocument,
    variables: {
      id: '123',
    },
  },
  result: { data: { market: { id: '123' } } },
};

export const ExplorerMarket456: MockedResponse = {
  request: {
    query: ExplorerMarketDocument,
    variables: {
      id: '456',
    },
  },
  result: { data: { market: { id: '456' } } },
};

export const ExplorerNode: MockedResponse = {
  request: {
    query: ExplorerNodeDocument,
    variables: {
      id: '123',
    },
  },
  result: { data: null },
};

export const commonLinkMocks: MockedResponse[] = [
  NodeNamesMock,
  ExplorerEpochForBlock,
  ExplorerMarket123,
  ExplorerNode,
];
