import { Schema } from '@vegaprotocol/types';

const marketTradingModeStyle = {
  [Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS]: '#00D46E',
  [Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: '#CF0064',
  [Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: '#0046CD',
  [Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: '#CF0064',
  [Schema.MarketTradingMode.TRADING_MODE_NO_TRADING]: '#CF0064',
};

export const getColorForStatus = (status: Schema.MarketTradingMode) =>
  marketTradingModeStyle[status];
