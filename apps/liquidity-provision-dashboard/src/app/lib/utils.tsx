import { MarketTradingMode } from '@vegaprotocol/types';

const marketTradingModeStyle = {
  [MarketTradingMode.TRADING_MODE_CONTINUOUS]: '#00D46E',
  [MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: '#CF0064',
  [MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: '#0046CD',
  [MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: '#CF0064',
  [MarketTradingMode.TRADING_MODE_NO_TRADING]: '#CF0064',
};

export const getColorForStatus = (status: MarketTradingMode) =>
  marketTradingModeStyle[status];
