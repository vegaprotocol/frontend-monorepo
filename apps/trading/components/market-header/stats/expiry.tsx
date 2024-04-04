import { useEnvironment } from '@vegaprotocol/environment';
import { MarketState as State } from '@vegaprotocol/types';
import { getMarketExpiryDate, useExpiryDate } from '@vegaprotocol/utils';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { useMarketState, type Market } from '@vegaprotocol/markets';

type ExpiryStatProps = HTMLAttributes<HTMLDivElement> & {
  market: Market;
};

/**
 * Shows the expected expiry time of the market or the datetime
 * of expirty if already expired. Only valid for Future products
 */
export const ExpiryStat = ({ market }: ExpiryStatProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const t = useT();
  return (
    <HeaderStat
      heading={t('Expiry')}
      description={
        <ExpiryTooltipContent market={market} explorerUrl={VEGA_EXPLORER_URL} />
      }
      data-testid="market-expiry"
    >
      <ExpiryLabel market={market} />
    </HeaderStat>
  );
};

const ExpiryLabel = ({ market }: { market: Market }) => {
  const { data: state } = useMarketState(market.id);
  const content = useExpiryDate(
    market.tradableInstrument.instrument.metadata.tags,
    market.marketTimestamps.close,
    state
  );
  return <div data-testid="trading-expiry">{content}</div>;
};

type ExpiryTooltipContentProps = {
  market: Market;
  explorerUrl?: string;
};

const ExpiryTooltipContent = ({
  market,
  explorerUrl,
}: ExpiryTooltipContentProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Future') {
    throw new Error('Invalid product type for ExpiryTooltipContent');
  }

  const { data: state } = useMarketState(market.id);

  const t = useT();

  if (market.marketTimestamps.close === null) {
    const oracleId =
      market.tradableInstrument.instrument.product
        .dataSourceSpecForTradingTermination.id;

    const metadataExpiryDate = getMarketExpiryDate(
      market.tradableInstrument.instrument.metadata.tags
    );

    const isExpired =
      metadataExpiryDate &&
      Date.now() - metadataExpiryDate.valueOf() > 0 &&
      (state === State.STATE_TRADING_TERMINATED ||
        state === State.STATE_SETTLED);

    return (
      <section data-testid="expiry-tooltip">
        <p className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {metadataExpiryDate && !isExpired && (
          <p className="mb-2">
            {t(
              'This timestamp is user curated metadata and does not drive any on-chain functionality.'
            )}
          </p>
        )}
        {explorerUrl && oracleId && (
          <Link href={`${explorerUrl}/oracles#${oracleId}`} target="_blank">
            {t('View oracle specification')}
          </Link>
        )}
      </section>
    );
  }

  return null;
};
