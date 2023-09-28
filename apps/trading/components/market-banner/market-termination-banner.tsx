import { useState } from 'react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { Intent, NotificationBanner } from '@vegaprotocol/ui-toolkit';
import { useMarketViewProposals } from '@vegaprotocol/proposals';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';

export const MarketTerminationBanner = ({
  marketId,
}: {
  marketId?: string;
}) => {
  const [visible, setVisible] = useState(true);
  const skip = !marketId || !visible;
  const proposalsData = useMarketViewProposals({
    skip,
    inState: Types.ProposalState.STATE_PASSED,
    typename: 'UpdateMarketState',
  });

  if (!marketId) return null;
  const marketFound = (proposalsData || []).find(
    (item) =>
      item.terms.change.__typename === 'UpdateMarketState' &&
      item.terms.change.market.id === marketId &&
      item.state === Types.ProposalState.STATE_PASSED // subscription doesn't have state parameter
  );

  const enactmentDatetime = new Date(marketFound?.terms.enactmentDatetime);
  const name =
    marketFound?.terms.change.__typename === 'UpdateMarketState'
      ? marketFound.terms.change.market.tradableInstrument.instrument.code
      : '';

  if (name && enactmentDatetime.getTime() > Date.now()) {
    const dayMonthDate = format(enactmentDatetime, 'dd MMMM');
    const duration = intervalToDuration({
      start: new Date(),
      end: enactmentDatetime,
    });
    const formattedDuration = formatDuration(duration, {
      format: ['days', 'hours'],
    });

    return (
      <NotificationBanner
        intent={Intent.Warning}
        onClose={() => {
          setVisible(false);
        }}
        data-testid={`termination-warning-banner-${marketId}`}
      >
        <div className="uppercase mb-1">
          {t('Trading on Market %s will stop on %s', [name, dayMonthDate])}
        </div>
        <div>
          {t(
            'This market will close to trading in %s. You will not be able to hold a position on this market after %s.',
            [formattedDuration, dayMonthDate]
          )}
        </div>
      </NotificationBanner>
    );
  }
  return null;
};
