import { aliasQuery } from '@vegaprotocol/cypress';
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
  marketQuery,
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
import type { MarketDataQuery, MarketQuery } from '@vegaprotocol/market-list';
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

const marketQueryOverride = (
  data: MarketPageMockData
): PartialDeep<MarketQuery> => ({
  market: {
    tradableInstrument: {
      instrument: {
        name: `${data.state?.toUpperCase()} MARKET`,
      },
    },
    state: data.state,
    tradingMode: data.tradingMode,
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
  aliasQuery(req, 'ChainId', chainIdQuery());
  aliasQuery(req, 'Statistics', statisticsQuery());
  aliasQuery(
    req,
    'Market',
    marketQuery(marketQueryOverride({ state, tradingMode, trigger }))
  );
  aliasQuery(req, 'Markets', marketsQuery());
  aliasQuery(
    req,
    'MarketData',
    marketDataQuery(marketDataOverride({ state, tradingMode, trigger }))
  );
  aliasQuery(req, 'MarketsData', marketsDataQuery());
  aliasQuery(req, 'MarketsCandles', marketsCandlesQuery());
  aliasQuery(req, 'MarketCandles', marketCandlesQuery());
  aliasQuery(req, 'MarketDepth', marketDepthQuery());
  aliasQuery(req, 'Orders', ordersQuery());
  aliasQuery(req, 'Accounts', accountsQuery());
  aliasQuery(req, 'Positions', positionsQuery());
  aliasQuery(req, 'Margins', marginsQuery());
  aliasQuery(req, 'Assets', assetsQuery());
  aliasQuery(req, 'Asset', assetQuery());
  aliasQuery(
    req,
    'MarketInfo',
    marketInfoQuery(marketInfoOverride({ state, tradingMode, trigger }))
  );
  aliasQuery(req, 'Trades', tradesQuery());
  aliasQuery(req, 'Chart', chartQuery());
  aliasQuery(req, 'Candles', candlesQuery());
  aliasQuery(req, 'Withdrawals', withdrawalsQuery());
  aliasQuery(req, 'NetworkParams', networkParamsQuery());
  aliasQuery(req, 'EstimateOrder', estimateOrderQuery());
  aliasQuery(req, 'ProposalsList', proposalListQuery());
  aliasQuery(req, 'Deposits', depositsQuery());
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
