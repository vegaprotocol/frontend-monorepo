import {
  marketDataProvider,
  type MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { getDateTimeFormat } from '@vegaprotocol/utils';
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
    ? new Date(auctionEnd).getTime() - Date.now()
    : 0;

  // Assuming remaining is in milliseconds, convert this to a proper duration format:
  const formatRemaining = (remaining: number) => {
    if (remaining < 0) return '00:00:00'; // Handle past end times

    let seconds = Math.floor(remaining / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    // Zero-padding function
    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const timeRemaining = formatRemaining(remaining);

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
