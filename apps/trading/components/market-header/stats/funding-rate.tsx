import { fromNanoSeconds } from '@vegaprotocol/utils';
import {
  isMarketInAuction,
  useFundingPeriodsQuery,
} from '@vegaprotocol/markets';
import { HeaderStat } from '../../../components/header';
import { useEffect, useState } from 'react';
import { useMarket, useOracle } from '@vegaprotocol/data-provider';
import { useT } from '../../../lib/use-t';
import { type MarketTradingMode } from '@vegaprotocol/types';

export const FundingRateStat = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const { data: market } = useMarket({ marketId });
  const fundingRate = market?.data?.productData?.fundingRate;

  const product = market?.tradableInstrument.instrument.product;
  const oracleSpecId =
    product?.__typename === 'Perpetual'
      ? product.dataSourceSpecForSettlementSchedule.id
      : undefined;

  return (
    <HeaderStat
      heading={`${t('Funding Rate')} / ${t('Countdown')}`}
      data-testid="market-funding"
    >
      <div className="flex gap-2">
        <FundingRate fundingRate={fundingRate} />
        <FundingCountdown
          marketId={marketId}
          oracleSpecId={oracleSpecId}
          tradingMode={market?.data?.marketTradingMode}
        />
      </div>
    </HeaderStat>
  );
};

const FundingRate = ({
  fundingRate,
}: {
  fundingRate: string | null | undefined;
}) => {
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

const useEvery = (oracleSpecId?: string) => {
  const { data } = useOracle({ oracleSpecId });

  let every: number | undefined = undefined;
  const sourceType = data?.data.sourceType.sourceType;

  if (sourceType?.__typename === 'DataSourceSpecConfigurationTimeTrigger') {
    every = sourceType.triggers?.[0]?.every ?? undefined;
    if (every) {
      every *= 1000;
    }
  }
  return every;
};

const useStartTime = (marketId: string, skip: boolean) => {
  // TODO: switch to react-query
  const { data: fundingPeriods } = useFundingPeriodsQuery({
    pollInterval: 5000,
    skip,
    variables: {
      marketId: marketId,
      pagination: { first: 1 },
    },
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

export const FundingCountdown = ({
  marketId,
  oracleSpecId,
  tradingMode,
}: {
  marketId: string;
  oracleSpecId?: string;
  tradingMode?: MarketTradingMode;
}) => {
  const now = useNow();
  const skip = !tradingMode || isMarketInAuction(tradingMode);
  const startTime = useStartTime(marketId, skip);
  const every = useEvery(oracleSpecId);

  return (
    <div data-testid="funding-countdown">
      {useFormatCountdown(now, startTime, every)}
    </div>
  );
};
