import { Link } from 'react-router-dom';
import { Intent, NotificationBanner } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useGetTerminationProposals } from '@vegaprotocol/proposals';
import { t } from '@vegaprotocol/i18n';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';
import { formatDuration, intervalToDuration } from 'date-fns';
import { Links } from '../../lib/links';

export const MarketTerminationBanner = ({
  marketId,
}: {
  marketId?: string;
}) => {
  const [visible, setVisible] = useState(true);

  const skip = !marketId || !visible;
  const proposalsData = useGetTerminationProposals({ skip });
  if (!marketId) return null;
  const marketFound = (proposalsData || []).find(
    (item) =>
      item.terms.change.__typename === 'UpdateMarketState' &&
      item.terms.change.market.id === marketId
  );
  const enactmentDatetime = new Date(marketFound?.terms.enactmentDatetime);
  const name =
    marketFound?.terms.change.__typename === 'UpdateMarketState'
      ? marketFound.terms.change.market.tradableInstrument.instrument.name
      : '';

  if (name && enactmentDatetime && enactmentDatetime.getTime() > Date.now()) {
    const dayMonthDate = formatDateWithLocalTimezone(
      enactmentDatetime,
      'dd MMMM'
    );
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
          {t('Market')} <Link to={Links.MARKET(marketId)}>{name}</Link>
          {t(
            'will close to trading in %s. You will not be able to hold a position on this market after %s.',
            [formattedDuration, dayMonthDate]
          )}
        </div>
      </NotificationBanner>
    );
  }
  return null;
};
