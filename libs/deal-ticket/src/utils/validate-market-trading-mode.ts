import { t } from '@vegaprotocol/i18n';
import { MarketTradingMode } from '@vegaprotocol/types';

export const validateMarketTradingMode = (
  marketTradingMode: MarketTradingMode
) => {
  if (marketTradingMode === MarketTradingMode.TRADING_MODE_NO_TRADING) {
    return t('Trading terminated');
  }

  return true;
};
