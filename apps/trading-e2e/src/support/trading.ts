import { aliasQuery } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import { generateAccounts } from './mocks/generate-accounts';
import { generateAsset, generateAssets } from './mocks/generate-assets';
import { generateCandles } from './mocks/generate-candles';
import { generateChart } from './mocks/generate-chart';
import { generateMarket, generateMarketData } from './mocks/generate-market';
import { generateMarketDepth } from './mocks/generate-market-depth';
import { generateMarketInfoQuery } from './mocks/generate-market-info-query';
import {
  generateMarkets,
  generateMarketsData,
  generateMarketsCandles,
} from './mocks/generate-markets';
import { generateNetworkParameters } from './mocks/generate-network-parameters';
import { generateOrders } from './mocks/generate-orders';
import { generateMargins, generatePositions } from './mocks/generate-positions';
import { generateTrades } from './mocks/generate-trades';
import { generateWithdrawals } from './mocks/generate-withdrawals';
import { generateEstimateOrder } from './mocks/generate-fees';
import { generateMarketProposals } from './mocks/generate-proposals';
import { generateStatistics } from './mocks/generate-statistics';
import { generateChainId } from './mocks/generate-chain-id';
import { generateDeposits } from './mocks/generate-deposits';

const mockTradingPage = (
  req: CyHttpMessages.IncomingHttpRequest,
  state: Schema.MarketState = Schema.MarketState.STATE_ACTIVE,
  tradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  // Skipped, to allow v2 wallet connection in tests
  aliasQuery(req, 'ChainId', generateChainId());
  aliasQuery(req, 'Statistics', generateStatistics());
  aliasQuery(
    req,
    'Market',
    generateMarket({
      market: {
        tradableInstrument: {
          instrument: {
            name: `${state.toUpperCase()} MARKET`,
          },
        },
        state: state,
        tradingMode: tradingMode,
      },
    })
  );
  aliasQuery(req, 'Markets', generateMarkets());
  aliasQuery(
    req,
    'MarketData',
    generateMarketData({
      trigger: trigger,
      marketTradingMode: tradingMode,
      marketState: state,
    })
  );
  aliasQuery(req, 'MarketsData', generateMarketsData());
  aliasQuery(req, 'MarketsCandles', generateMarketsCandles());
  aliasQuery(req, 'MarketCandles', generateMarketsCandles());

  aliasQuery(req, 'MarketDepth', generateMarketDepth());
  aliasQuery(req, 'Orders', generateOrders());
  aliasQuery(req, 'Accounts', generateAccounts());
  aliasQuery(req, 'Positions', generatePositions());
  aliasQuery(req, 'Margins', generateMargins());
  aliasQuery(req, 'Assets', generateAssets());
  aliasQuery(req, 'Asset', generateAsset());

  aliasQuery(
    req,
    'MarketInfo',
    generateMarketInfoQuery({
      market: {
        state,
        tradingMode: tradingMode,
        data: {
          trigger: trigger,
        },
      },
    })
  );
  aliasQuery(req, 'Trades', generateTrades());
  aliasQuery(req, 'Chart', generateChart());
  aliasQuery(req, 'Candles', generateCandles());
  aliasQuery(req, 'Withdrawals', generateWithdrawals());
  aliasQuery(req, 'NetworkParams', generateNetworkParameters());
  aliasQuery(req, 'EstimateOrder', generateEstimateOrder());
  aliasQuery(req, 'MarketPositions', generatePositions());
  aliasQuery(req, 'ProposalsList', generateMarketProposals());
  aliasQuery(req, 'Deposits', generateDeposits());
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
