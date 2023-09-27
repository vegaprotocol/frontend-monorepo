import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useGetTerminationProposals } from '@vegaprotocol/proposals';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';
import { formatDuration, intervalToDuration } from 'date-fns';

export const MarketTerminationBanner = () => {
  const [hiddens, setHiddens] = useState<string[]>([]);
  const { pubKey, pubKeys } = useVegaWallet();

  const partyIds = pubKeys?.map((item) => item.publicKey) || [];
  const { data: positionsData } = useDataProvider({
    dataProvider: positionsDataProvider,
    variables: {
      partyIds,
    },
    skip: !partyIds?.length,
  });
  const marketsId = (positionsData || []).map((item) => item.market.id);

  const skip = !pubKey || !marketsId.length;
  const proposalsData = useGetTerminationProposals({ skip });

  const marketsMatched = (proposalsData || [])
    .filter((item) =>
      marketsId.some(
        (marketId) =>
          item.terms.change.__typename === 'UpdateMarketState' &&
          item.terms.change.market.id === marketId
      )
    )
    .map((item) => ({
      enactmentDatetime: item.terms.enactmentDatetime,
      name:
        item.terms.change.__typename === 'UpdateMarketState'
          ? item.terms.change.market.tradableInstrument.instrument.name
          : '',
      id:
        item.terms.change.__typename === 'UpdateMarketState'
          ? item.terms.change.market.id
          : '',
    }));

  if (marketsMatched.length) {
    return marketsMatched.map((item) => {
      const hide = hiddens.includes(item.id);
      const dayMonthDate = formatDateWithLocalTimezone(
        new Date(item.enactmentDatetime),
        'dd MMMM'
      );
      const duration = intervalToDuration({
        start: new Date(),
        end: new Date(item.enactmentDatetime),
      });
      const formattedDuration = formatDuration(duration, {
        format: ['days', 'hours'],
      });
      if (hide) return null;
      return (
        <NotificationBanner
          key={item.id}
          intent={Intent.Warning}
          onClose={() => {
            setHiddens((hiddens) => [...hiddens, item.id]);
          }}
          data-testid={`termination-warning-banner-${item.id}`}
        >
          <div className="uppercase mb-1">
            {t('Trading on Market %s will stop on %s', [
              item.name,
              dayMonthDate,
            ])}
          </div>
          <div>
            {t('Market')}{' '}
            <ExternalLink href={`/#/markets/${item.id}`}>
              {item.name}
            </ExternalLink>
            {t(
              'will close to trading in %s. You will not be able to hold a position on this market after %s.',
              [formattedDuration, dayMonthDate]
            )}
          </div>
        </NotificationBanner>
      );
    });
  }
  return null;
};
