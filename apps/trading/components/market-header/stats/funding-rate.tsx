import { fromNanoSeconds } from '@vegaprotocol/utils';
import { isMarketInAuction } from '@vegaprotocol/markets';
import { HeaderStat } from '../../../components/header';
import { useEffect, useState } from 'react';
import { useT } from '../../../lib/use-t';
import { getProduct, useMarket } from '../../../lib/hooks/use-markets';
import { MarketTradingMode } from '@vegaprotocol/types';
import { useOracleSpec } from '../../../lib/hooks/use-oracle-spec';
import { useFundingPeriods } from '../../../lib/hooks/use-funding-periods';

export const FundingRateStat = ({ marketId }: { marketId: string }) => {
  const t = useT();

  return (
    <HeaderStat
      heading={`${t('Funding Rate')} / ${t('Countdown')}`}
      data-testid="market-funding"
    >
      <div className="flex gap-2">
        <FundingRate marketId={marketId} />
        <FundingCountdown marketId={marketId} />
      </div>
    </HeaderStat>
  );
};

const FundingRate = ({ marketId }: { marketId: string }) => {
  const { data } = useMarket({ marketId });

  const fundingRate =
    data?.data &&
    ![
      MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE,
    ].includes(data.data.marketTradingMode)
      ? data.data?.productData?.fundingRate || null
      : null;

  return (
    <div data-testid="funding-rate">
      {fundingRate ? `${(Number(fundingRate) * 100).toFixed(4)}%` : '-'}
    </div>
  );
};

const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
};

const useEvery = (marketId: string, skip: boolean) => {
  const { data } = useMarket({ marketId });
  const product = data && getProduct(data);
  const oracleSpecId =
    product &&
    product.__typename === 'Perpetual' &&
    product.dataSourceSpecForSettlementSchedule.id;

  const { data: oracleSpec } = useOracleSpec({
    oracleSpecId: oracleSpecId || '',
    enabled: !skip,
  });

  let every: number | undefined = undefined;

  const sourceType = oracleSpec?.data.sourceType.sourceType;

  if (sourceType?.__typename === 'DataSourceSpecConfigurationTimeTrigger') {
    every = sourceType.triggers?.[0]?.every ?? undefined;
    if (every) {
      every *= 1000;
    }
  }

  return every;
};

const useStartTime = (marketId: string, skip: boolean) => {
  const { data: fundingPeriods } = useFundingPeriods({
    marketId,
    enabled: !skip,
  });
  const node = fundingPeriods?.fundingPeriods.edges?.[0]?.node;
  let startTime: number | undefined = undefined;
  if (node && node.startTime && !node.endTime) {
    startTime = fromNanoSeconds(node.startTime).getTime();
  }
  return startTime;
};

const padStart = (n: number) => n.toString().padStart(2, '0');

const useFormatCountdown = (
  now: number,
  startTime?: number,
  every?: number
) => {
  const t = useT();
  if (startTime && every) {
    const diff = every - ((now - startTime) % every);
    const hours = (diff / 3.6e6) | 0;
    const mins = ((diff % 3.6e6) / 6e4) | 0;
    const secs = Math.round((diff % 6e4) / 1e3);
    return `${padStart(hours)}:${padStart(mins)}:${padStart(secs)}`;
  }
  return t('Unknown');
};

export const FundingCountdown = ({ marketId }: { marketId: string }) => {
  const now = useNow();
  const { data } = useMarket({ marketId });
  const marketTradingMode = data?.data?.marketTradingMode;
  const skip = !marketTradingMode || isMarketInAuction(marketTradingMode);
  const startTime = useStartTime(marketId, skip);
  const every = useEvery(marketId, skip);

  return (
    <div data-testid="funding-countdown">
      {useFormatCountdown(now, startTime, every)}
    </div>
  );
};
