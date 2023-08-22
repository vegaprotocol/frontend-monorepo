import * as Schema from '@vegaprotocol/types';
import { Intent } from '@vegaprotocol/ui-toolkit';

const marketTradingModeStyle = {
  [Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS]: '#00D46E',
  [Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: '#CF0064',
  [Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: '#0046CD',
  [Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: '#CF0064',
  [Schema.MarketTradingMode.TRADING_MODE_NO_TRADING]: '#CF0064',
  [Schema.MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE]: '#CF0064',
};

export const getColorForStatus = (status: Schema.MarketTradingMode) =>
  marketTradingModeStyle[status];

const marketTradingModeIntent = {
  [Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS]: Intent.Success,
  [Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: Intent.Danger,
  [Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: Intent.Primary,
  [Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: Intent.Danger,
  [Schema.MarketTradingMode.TRADING_MODE_NO_TRADING]: Intent.Danger,
  [Schema.MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE]:
    Intent.Danger,
};

export const intentForStatus = (status: Schema.MarketTradingMode) => {
  return marketTradingModeIntent[status];
};
