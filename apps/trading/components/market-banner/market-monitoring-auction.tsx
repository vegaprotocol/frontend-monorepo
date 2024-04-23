import {
  marketDataProvider,
  type MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import {
  getCurrentTimeInLocal,
  getDateTimeFormat,
  getTimeFormat,
} from '@vegaprotocol/utils';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';

export const MarketAuctionBanner = ({
  market,
}: {
  market: MarketFieldsFragment;
}) => {
  const t = useT();
  const { data: marketData } = useThrottledDataProvider(
    {
      dataProvider: marketDataProvider,
      variables: { marketId: market.id },
      skip: !market.id,
    },
    1000
  );
  if (!marketData) return null;
  const { auctionEnd, auctionStart } = marketData;
  const startDate =
    auctionStart && getDateTimeFormat().format(new Date(auctionStart));
  const endDate =
    auctionEnd && getDateTimeFormat().format(new Date(auctionEnd));

  const remaining = auctionEnd
    ? new Date(auctionEnd).getTime() - getCurrentTimeInLocal().getTime()
    : 0;

  const timeRemaining = getTimeFormat().format(new Date(remaining));

  return (
    <p>
      <span>
        {t(
          'This market is in auction due to high price volatility, but you can still place orders. '
        )}
      </span>
      {timeRemaining && (
        <span>
          {t(
            'Time remaining: {{timeRemaining}} (from {{startDate}} to {{endDate}})',
            {
              startDate,
              endDate,
              timeRemaining,
            }
          )}
        </span>
      )}
      {DocsLinks && (
        <ExternalLink
          href={DocsLinks.AUCTION_TYPE_PRICE_MONITORING}
          className="ml-1"
        >
          {t('Find out more')}
        </ExternalLink>
      )}
    </p>
  );
};
