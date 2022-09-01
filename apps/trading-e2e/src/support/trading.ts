import { aliasQuery } from '@vegaprotocol/cypress';
import type { MarketState } from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import { generateAccounts } from './mocks/generate-accounts';
import { generateCandles } from './mocks/generate-candles';
import { generateChart } from './mocks/generate-chart';
import { generateDealTicketQuery } from './mocks/generate-deal-ticket-query';
import { generateMarket } from './mocks/generate-market';
import { generateMarketDepth } from './mocks/generate-market-depth';
import { generateMarketInfoQuery } from './mocks/generate-market-info-query';
import { generateOrders } from './mocks/generate-orders';
import { generatePositions } from './mocks/generate-positions';
import { generateTrades } from './mocks/generate-trades';

export const mockTradingPage = (
  req: CyHttpMessages.IncomingHttpRequest,
  state: MarketState
) => {
  aliasQuery(
    req,
    'Market',
    generateMarket({
      market: {
        name: `${state.toUpperCase()} MARKET`,
        state: state,
      },
    })
  );
  aliasQuery(req, 'MarketDepth', generateMarketDepth());
  aliasQuery(req, 'Orders', generateOrders());
  aliasQuery(req, 'Accounts', generateAccounts());
  aliasQuery(req, 'Positions', generatePositions());
  aliasQuery(
    req,
    'DealTicketQuery',
    generateDealTicketQuery({ market: { state } })
  );
  aliasQuery(
    req,
    'MarketInfoQuery',
    generateMarketInfoQuery({ market: { state } })
  );
  aliasQuery(req, 'Trades', generateTrades());
  aliasQuery(req, 'Chart', generateChart());
  aliasQuery(req, 'Candles', generateCandles());
};
