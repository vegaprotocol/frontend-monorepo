import throttle from 'lodash/throttle';
import type { MarketData, Market } from '@vegaprotocol/markets';
import { marketDataProvider } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../header';
import { useCallback, useRef, useState } from 'react';
import * as constants from '../constants';
import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

export const MarketState = ({ market }: { market: Market | null }) => {
  const [marketState, setMarketState] = useState<Schema.MarketState | null>(
    null
  );

  const throttledSetMarketState = useRef(
    throttle((state: Schema.MarketState) => {
      setMarketState(state);
    }, constants.THROTTLE_UPDATE_TIME)
  ).current;

  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (marketData) {
        throttledSetMarketState(marketData.marketState);
      }
      return true;
    },
    [throttledSetMarketState]
  );

  useDataProvider({
    dataProvider: marketDataProvider,
    update,
    variables: { marketId: market?.id || '' },
    skip: !market?.id,
  });

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

const getMarketStateTooltip = (state: Schema.MarketState | null) => {
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

  if (state === Schema.MarketState.STATE_SUSPENDED_VIA_GOVERNANCE) {
    return (
      <p>
        {t(
          `This market has been suspended via a governance vote and can be resumed or terminated by further votes.`
        )}
        {DocsLinks && (
          <ExternalLink href={DocsLinks.MARKET_LIFECYCLE} className="ml-1">
            {t('Find out more')}
          </ExternalLink>
        )}
      </p>
    );
  }

  return undefined;
};
