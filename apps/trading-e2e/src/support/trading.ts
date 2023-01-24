import { aliasGQLQuery } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import {
  accountsQuery,
  assetQuery,
  assetsQuery,
  candlesQuery,
  chainIdQuery,
  chartQuery,
  depositsQuery,
  estimateOrderQuery,
  marginsQuery,
  marketCandlesQuery,
  marketDataQuery,
  marketDepthQuery,
  marketInfoQuery,
  marketsCandlesQuery,
  marketsDataQuery,
  marketsQuery,
  networkParamsQuery,
  ordersQuery,
  positionsQuery,
  proposalListQuery,
  statisticsQuery,
  tradesQuery,
  withdrawalsQuery,
} from '@vegaprotocol/mock';
import type { PartialDeep } from 'type-fest';
import type { MarketDataQuery, MarketsQuery } from '@vegaprotocol/market-list';
import type { MarketInfoQuery } from '@vegaprotocol/market-info';

type MarketPageMockData = {
  state: Schema.MarketState;
  tradingMode?: Schema.MarketTradingMode;
  trigger?: Schema.AuctionTrigger;
};

const marketDataOverride = (
  data: MarketPageMockData
): PartialDeep<MarketDataQuery> => ({
  marketsConnection: {
    edges: [
      {
        node: {
          data: {
            trigger: data.trigger,
            marketTradingMode: data.tradingMode,
            marketState: data.state,
          },
        },
      },
    ],
  },
});

const marketsDataOverride = (
  data: MarketPageMockData
): PartialDeep<MarketsQuery> => ({
  marketsConnection: {
    edges: [
      {
        node: {
          tradingMode: data.tradingMode,
          state: data.state,
        },
      },
    ],
  },
});

const marketInfoOverride = (
  data: MarketPageMockData
): PartialDeep<MarketInfoQuery> => ({
  market: {
    state: data.state,
    tradingMode: data.tradingMode,
    data: {
      trigger: data.trigger,
    },
  },
});

const mockTradingPage = (
  req: CyHttpMessages.IncomingHttpRequest,
  state: Schema.MarketState = Schema.MarketState.STATE_ACTIVE,
  tradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  aliasGQLQuery(req, 'ChainId', chainIdQuery());
  aliasGQLQuery(req, 'Statistics', statisticsQuery());
  aliasGQLQuery(
    req,
    'Markets',
    marketsQuery(marketsDataOverride({ state, tradingMode, trigger }))
  );
  aliasGQLQuery(
    req,
    'MarketData',
    marketDataQuery(marketDataOverride({ state, tradingMode, trigger }))
  );
  aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
  aliasGQLQuery(req, 'MarketsCandles', marketsCandlesQuery());
  aliasGQLQuery(req, 'MarketCandles', marketCandlesQuery());
  aliasGQLQuery(req, 'MarketDepth', marketDepthQuery());
  aliasGQLQuery(req, 'Orders', ordersQuery());
  aliasGQLQuery(req, 'Accounts', accountsQuery());
  aliasGQLQuery(req, 'Positions', positionsQuery());
  aliasGQLQuery(req, 'Margins', marginsQuery());
  aliasGQLQuery(req, 'Assets', assetsQuery());
  aliasGQLQuery(req, 'Asset', assetQuery());
  aliasGQLQuery(
    req,
    'MarketInfo',
    marketInfoQuery(marketInfoOverride({ state, tradingMode, trigger }))
  );
  aliasGQLQuery(req, 'Trades', tradesQuery());
  aliasGQLQuery(req, 'Chart', chartQuery());
  aliasGQLQuery(req, 'Candles', candlesQuery());
  aliasGQLQuery(req, 'Withdrawals', withdrawalsQuery());
  aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
  aliasGQLQuery(req, 'EstimateOrder', estimateOrderQuery());
  aliasGQLQuery(req, 'ProposalsList', proposalListQuery());
  aliasGQLQuery(req, 'Deposits', depositsQuery());
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockTradingPage(
        state?: Schema.MarketState,
        tradingMode?: Schema.MarketTradingMode,
        trigger?: Schema.AuctionTrigger
      ): void;
    }
  }
}
export const addMockTradingPage = () => {
  Cypress.Commands.add(
    'mockTradingPage',
    (state = Schema.MarketState.STATE_ACTIVE, tradingMode, trigger) => {
      cy.mockGQL((req) => {
        mockTradingPage(req, state, tradingMode, trigger);
      });
    }
  );
};
