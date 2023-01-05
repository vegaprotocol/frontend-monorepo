import { t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../header';

export const MarketState = ({
  marketState,
}: {
  marketState?: Schema.MarketState;
}) => {
  return (
    <HeaderStat
      heading={t('Status')}
      description={getMarketStateTooltip(marketState)}
      testId="market-state"
    >
      {marketState ? Schema.MarketStateMapping[marketState] : '-'}
    </HeaderStat>
  );
};

const getMarketStateTooltip = (state?: Schema.MarketState) => {
  if (state === Schema.MarketState.STATE_ACTIVE) {
    return t('Enactment date reached and usual auction exit checks pass');
  }

  if (state === Schema.MarketState.STATE_CANCELLED) {
    return t(
      'Market triggers cancellation or governance vote has passed to cancel'
    );
  }

  if (state === Schema.MarketState.STATE_CLOSED) {
    return t('Governance vote passed to close the market');
  }

  if (state === Schema.MarketState.STATE_PENDING) {
    return t(
      'Governance vote has passed and market is awaiting opening auction exit'
    );
  }

  if (state === Schema.MarketState.STATE_PROPOSED) {
    return t('Governance vote for this market is valid and has been accepted');
  }

  if (state === Schema.MarketState.STATE_REJECTED) {
    return t('Governance vote for this market has been rejected');
  }

  if (state === Schema.MarketState.STATE_SETTLED) {
    return t('Settlement defined by product has been triggered and completed');
  }

  if (state === Schema.MarketState.STATE_SUSPENDED) {
    return t('Suspended due to price or liquidity monitoring trigger');
  }

  if (state === Schema.MarketState.STATE_TRADING_TERMINATED) {
    return t(
      'Trading has been terminated as a result of the product definition'
    );
  }

  return undefined;
};
