import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';

export const validateMarketTradingMode = (
  tradingMode: Schema.MarketTradingMode
) => {
  if (
    [
      Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    ].includes(tradingMode)
  ) {
    return t('Any orders placed now will not trade until the auction ends');
  }

  return true;
};
