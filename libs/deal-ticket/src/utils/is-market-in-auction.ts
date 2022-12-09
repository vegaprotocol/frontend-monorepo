import * as Schema from '@vegaprotocol/types';

export const isMarketInAuction = (market: {
  data: {
    marketTradingMode: Schema.MarketTradingMode;
  };
}) => {
  return [
    Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(market.data.marketTradingMode);
};
