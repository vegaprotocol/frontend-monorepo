import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../../header';
import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { useMarket } from '../../../lib/hooks/use-markets';

export const MarketStateStat = ({ marketId }: { marketId?: string }) => {
  const t = useT();
  const { data } = useMarket({ marketId });
  const marketState = data?.data?.marketState;
  return (
    <HeaderStat
      heading={t('Status')}
      description={useGetMarketStateTooltip(marketState ?? undefined)}
      data-testid="market-state"
    >
      {marketState ? Schema.MarketStateMapping[marketState] : '-'}
    </HeaderStat>
  );
};

const useGetMarketStateTooltip = (state?: Schema.MarketState) => {
  const t = useT();
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
          'This market has been suspended via a governance vote and can be resumed or terminated by further votes.'
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
