import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';

export const validateMarketState = (state: Schema.MarketState) => {
  if (
    [
      Schema.MarketState.STATE_SETTLED,
      Schema.MarketState.STATE_REJECTED,
      Schema.MarketState.STATE_TRADING_TERMINATED,
      Schema.MarketState.STATE_CANCELLED,
      Schema.MarketState.STATE_CLOSED,
    ].includes(state)
  ) {
    return t(
      `This market is ${marketTranslations(state)} and not accepting orders`
    );
  }

  if (state === Schema.MarketState.STATE_PROPOSED) {
    return t(
      `This market is ${marketTranslations(
        state
      )} and only accepting liquidity commitment orders`
    );
  }

  return true;
};

const marketTranslations = (marketState: Schema.MarketState) => {
  switch (marketState) {
    case Schema.MarketState.STATE_TRADING_TERMINATED:
      return t('terminated');
    default:
      return t(Schema.MarketStateMapping[marketState]).toLowerCase();
  }
};
