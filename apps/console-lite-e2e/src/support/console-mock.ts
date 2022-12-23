import { aliasGQLQuery } from '@vegaprotocol/cypress';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import {
  accountsQuery,
  assetsQuery,
  chainIdQuery,
  estimateOrderQuery,
  fillsQuery,
  marginsQuery,
  marketDataQuery,
  marketDepthQuery,
  marketQuery,
  marketsCandlesQuery,
  marketsDataQuery,
  marketsQuery,
  ordersQuery,
  positionsQuery,
  statisticsQuery,
} from '@vegaprotocol/mock';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockConsole(): void;
    }
  }
}

const mockPage = (req: CyHttpMessages.IncomingHttpRequest) => {
  aliasGQLQuery(req, 'ChainId', chainIdQuery());
  aliasGQLQuery(req, 'Statistics', statisticsQuery());
  aliasGQLQuery(req, 'Markets', marketsQuery());
  aliasGQLQuery(req, 'MarketsCandles', marketsCandlesQuery());
  aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
  aliasGQLQuery(req, 'MarketData', marketDataQuery());
  aliasGQLQuery(req, 'Market', marketQuery());
  aliasGQLQuery(req, 'MarketTags', {});
  aliasGQLQuery(req, 'EstimateOrder', estimateOrderQuery());
  aliasGQLQuery(req, 'MarketNames', {});
  aliasGQLQuery(req, 'MarketDepth', marketDepthQuery());
  aliasGQLQuery(req, 'Positions', positionsQuery());
  aliasGQLQuery(req, 'Margins', marginsQuery());
  aliasGQLQuery(req, 'Accounts', accountsQuery());
  aliasGQLQuery(req, 'Assets', assetsQuery());
  aliasGQLQuery(req, 'SimpleMarkets', marketsQuery());
  aliasGQLQuery(req, 'Orders', ordersQuery());
  aliasGQLQuery(req, 'Fills', fillsQuery());
};

export const addMockConsole = () => {
  Cypress.Commands.add('mockConsole', () => {
    cy.mockGQL(mockPage);
  });
};
