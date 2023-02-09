import { t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';

export const validateMarketTradingMode = (
  marketTradingMode: Schema.MarketTradingMode
) => {
  if (marketTradingMode === Schema.MarketTradingMode.TRADING_MODE_NO_TRADING) {
    return t('Trading terminated');
  }

  return true;
};
