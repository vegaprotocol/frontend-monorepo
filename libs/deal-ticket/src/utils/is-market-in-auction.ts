import { Schema } from '@vegaprotocol/types';
import type { MarketDealTicket } from '@vegaprotocol/market-list';

export const isMarketInAuction = (market: MarketDealTicket) => {
  return [
    Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(market.tradingMode);
};
