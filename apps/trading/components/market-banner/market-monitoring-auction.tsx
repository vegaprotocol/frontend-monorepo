import {
  marketDataProvider,
  type MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { formatDuration } from 'date-fns';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';

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
  const { auctionEnd, auctionStart, trigger, marketTradingMode } = marketData;

  const startDate =
    auctionStart && getDateTimeFormat().format(new Date(auctionStart));
  const endDate =
    auctionEnd && getDateTimeFormat().format(new Date(auctionEnd));

  const remaining = auctionEnd
    ? new Date(auctionEnd).getTime() - Date.now()
    : 0;

  const formatRemaining = (remaining: number) => {
    if (remaining <= 0) return undefined;

    let seconds = Math.floor(remaining / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return formatDuration({ hours, minutes, seconds });
  };

  const timeRemaining = formatRemaining(remaining);

  let auctionDescription = t(
    'This market is in auction due to high price volatility, but you can still place orders. '
  );
  let docsLink: string | undefined = DocsLinks?.AUCTION_TYPE_PRICE_MONITORING;

  if (
    marketTradingMode === MarketTradingMode.TRADING_MODE_LONG_BLOCK_AUCTION ||
    trigger === AuctionTrigger.AUCTION_TRIGGER_LONG_BLOCK
  ) {
    auctionDescription = t(
      'This market is in auction due to slow block processing, but you can still place orders.'
    );
    docsLink = DocsLinks?.AUCTION_TYPE_BLOCK_TIME;
  }

  return (
    <p>
      <span>{auctionDescription}</span>
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
      {docsLink && (
        <ExternalLink href={docsLink} className="ml-1">
          {t('Find out more')}
        </ExternalLink>
      )}
    </p>
  );
};
