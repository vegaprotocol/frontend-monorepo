import { useState } from 'react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { Intent, NotificationBanner } from '@vegaprotocol/ui-toolkit';
import { useMarketViewProposals } from '@vegaprotocol/proposals';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/markets';
import { getQuoteName } from '@vegaprotocol/markets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export const MarketTerminationBanner = ({
  market,
}: {
  market: Market | null;
}) => {
  const [visible, setVisible] = useState(true);
  const skip = !market || !visible;
  const proposalsData = useMarketViewProposals({
    skip,
    inState: Types.ProposalState.STATE_PASSED,
    typename: 'UpdateMarketState',
  });

  if (!market) return null;
  const marketFound = (proposalsData || []).find(
    (item) =>
      item.terms.change.__typename === 'UpdateMarketState' &&
      item.terms.change.market.id === market.id &&
      item.terms.change.updateType ===
        Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE &&
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
    const price =
      marketFound?.terms.change.__typename === 'UpdateMarketState'
        ? marketFound.terms.change.price
        : '';
    const assetSymbol = getQuoteName(market);
    return (
      <NotificationBanner
        intent={Intent.Warning}
        onClose={() => {
          setVisible(false);
        }}
        data-testid={`termination-warning-banner-${market.id}`}
      >
        <div className="uppercase mb-1">
          {t('Trading on Market %s will stop on %s', [name, dayMonthDate])}
        </div>
        <div>
          {t(
            'This market will close to trading in %s. You will not be able to hold a position on this market after %s.',
            [formattedDuration, dayMonthDate]
          )}{' '}
          {price &&
            assetSymbol &&
            t('The final price will be %s %s', [
              addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            ])}
        </div>
      </NotificationBanner>
    );
  }
  return null;
};
