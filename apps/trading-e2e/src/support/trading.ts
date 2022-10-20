import { aliasQuery } from '@vegaprotocol/cypress';
import type { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import { generateAccounts } from './mocks/generate-accounts';
import { generateAsset, generateAssets } from './mocks/generate-assets';
import { generateCandles } from './mocks/generate-candles';
import { generateChainId } from './mocks/generate-chain-id';
import { generateChart } from './mocks/generate-chart';
import { generateDealTicketQuery } from './mocks/generate-deal-ticket-query';
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
import { generateStatistics } from './mocks/generate-statistics';
import { generateTrades } from './mocks/generate-trades';
import { generateWithdrawals } from './mocks/generate-withdrawals';

const mockTradingPage = (
  req: CyHttpMessages.IncomingHttpRequest,
  state: MarketState = MarketState.STATE_ACTIVE,
  tradingMode?: MarketTradingMode,
  trigger?: AuctionTrigger
) => {
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
    })
  );
  aliasQuery(req, 'MarketsData', generateMarketsData());
  aliasQuery(req, 'MarketsCandles', generateMarketsCandles());

  aliasQuery(req, 'MarketDepth', generateMarketDepth());
  aliasQuery(req, 'Orders', generateOrders());
  aliasQuery(req, 'Accounts', generateAccounts());
  aliasQuery(req, 'Positions', generatePositions());
  aliasQuery(req, 'Margins', generateMargins());
  aliasQuery(
    req,
    'DealTicket',
    generateDealTicketQuery({
      market: {
        state,
        tradingMode: tradingMode,
        data: {
          trigger: trigger,
        },
      },
    })
  );
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
  aliasQuery(req, 'NetworkParamsQuery', generateNetworkParameters());
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockTradingPage(
        state?: MarketState,
        tradingMode?: MarketTradingMode,
        trigger?: AuctionTrigger
      ): void;
    }
  }
}
export const addMockTradingPage = () => {
  Cypress.Commands.add(
    'mockTradingPage',
    (state = MarketState.STATE_ACTIVE, tradingMode, trigger) => {
      cy.mockGQL((req) => {
        mockTradingPage(req, state, tradingMode, trigger);
      });
    }
  );
};
