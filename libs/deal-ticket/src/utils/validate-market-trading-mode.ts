import { MarketTradingMode } from '@vegaprotocol/types';

export const validateMarketTradingMode = (
  marketTradingMode: MarketTradingMode,
  errorMessage: string
) => {
  if (marketTradingMode === MarketTradingMode.TRADING_MODE_NO_TRADING) {
    return errorMessage;
  }

  return true;
};
