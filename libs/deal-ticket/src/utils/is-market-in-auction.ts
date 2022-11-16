import { Schema } from '@vegaprotocol/types';
import type { DealTicketMarketFragment } from '../components';

export const isMarketInAuction = (market: DealTicketMarketFragment) => {
  return [
    Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(market.tradingMode);
};
