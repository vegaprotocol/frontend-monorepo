import { aliasQuery } from '@vegaprotocol/cypress';
import type {
  MarketState,
  MarketTradingMode,
  AuctionTrigger,
} from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import { generateAccounts } from './mocks/generate-accounts';
import { generateAsset, generateAssets } from './mocks/generate-assets';
import { generateCandles } from './mocks/generate-candles';
import { generateChart } from './mocks/generate-chart';
import { generateDealTicketQuery } from './mocks/generate-deal-ticket-query';
import { generateMarket } from './mocks/generate-market';
import { generateMarketDepth } from './mocks/generate-market-depth';
import { generateMarketInfoQuery } from './mocks/generate-market-info-query';
import {
  generateMarkets,
  generateMarketsData,
  generateMarketsCandles,
} from './mocks/generate-markets';
import { generateOrders } from './mocks/generate-orders';
import { generateMargins, generatePositions } from './mocks/generate-positions';
import { generateTrades } from './mocks/generate-trades';

export const mockTradingPage = (
  req: CyHttpMessages.IncomingHttpRequest,
  state: MarketState,
  tradingMode?: MarketTradingMode,
  trigger?: AuctionTrigger
) => {
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
        data: {
          trigger: trigger,
        },
      },
    })
  );
  aliasQuery(req, 'Markets', generateMarkets());
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
    'MarketInfoQuery',
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
};
