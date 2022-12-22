import { aliasQuery } from '@vegaprotocol/cypress';
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
  aliasQuery(req, 'ChainId', chainIdQuery());
  aliasQuery(req, 'Statistics', statisticsQuery());
  aliasQuery(req, 'Markets', marketsQuery());
  aliasQuery(req, 'MarketsCandles', marketsCandlesQuery());
  aliasQuery(req, 'MarketsData', marketsDataQuery());
  aliasQuery(req, 'MarketData', marketDataQuery());
  aliasQuery(req, 'Market', marketQuery());
  aliasQuery(req, 'MarketTags', {});
  aliasQuery(req, 'EstimateOrder', estimateOrderQuery());
  aliasQuery(req, 'MarketNames', {});
  aliasQuery(req, 'MarketDepth', marketDepthQuery());
  aliasQuery(req, 'Positions', positionsQuery());
  aliasQuery(req, 'Margins', marginsQuery());
  aliasQuery(req, 'Accounts', accountsQuery());
  aliasQuery(req, 'Assets', assetsQuery());
  aliasQuery(req, 'SimpleMarkets', marketsQuery());
  aliasQuery(req, 'Orders', ordersQuery());
  aliasQuery(req, 'Fills', fillsQuery());
};

export const addMockConsole = () => {
  Cypress.Commands.add('mockConsole', () => {
    cy.mockGQL(mockPage);
  });
};
