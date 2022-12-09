import { t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';

export const validateMarketTradingMode = (
  tradingMode: Schema.MarketTradingMode
) => {
  if (tradingMode === Schema.MarketTradingMode.TRADING_MODE_NO_TRADING) {
    return t('Trading terminated');
  }

  return true;
};
