import { t } from '@vegaprotocol/i18n';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';

export const validateMarketState = (state: MarketState) => {
  if (
    [
      MarketState.STATE_SETTLED,
      MarketState.STATE_REJECTED,
      MarketState.STATE_TRADING_TERMINATED,
      MarketState.STATE_CANCELLED,
      MarketState.STATE_CLOSED,
    ].includes(state)
  ) {
    return t(
      `This market is ${marketTranslations(state)} and not accepting orders`
    );
  }

  if (state === MarketState.STATE_PROPOSED) {
    return t(
      `This market is ${marketTranslations(
        state
      )} and only accepting liquidity commitment orders`
    );
  }

  return true;
};

const marketTranslations = (marketState: MarketState) => {
  switch (marketState) {
    case MarketState.STATE_TRADING_TERMINATED:
      return t('terminated');
    default:
      return t(MarketStateMapping[marketState]).toLowerCase();
  }
};
