import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/markets';
import { addDecimalsFormatNumber, fromNanoSeconds } from '@vegaprotocol/utils';
import {
  getAsset,
  getDataSourceSpecForSettlementSchedule,
  isMarketInAuction,
  marketInfoProvider,
  useFundingPeriodsQuery,
  useFundingRate,
  useMarketTradingMode,
  useExternalTwap,
  getQuoteName,
  useMarketState,
} from '@vegaprotocol/markets';
import { HeaderStat } from '../../components/header';
import { HeaderStatMarketTradingMode } from '../../components/market-trading-mode';
import { MarketState } from '../../components/market-state';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';
import { useEffect, useState } from 'react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { PriceCell } from '@vegaprotocol/datagrid';
import { useT } from '../../lib/use-t';
import * as Stats from './stats';

interface MarketHeaderPerpProps {
  market: Market;
}

export const MarketHeaderPerp = ({ market }: MarketHeaderPerpProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Perpetual') {
    throw new Error('incorrect market type for header');
  }

  const t = useT();

  const asset = getAsset(market);
  const quoteUnit = getQuoteName(market);

  const dataSourceSpec = market.markPriceConfiguration?.dataSourcesSpec?.[1];
  const sourceType =
    dataSourceSpec?.sourceType.__typename === 'DataSourceDefinitionExternal' &&
    dataSourceSpec?.sourceType.sourceType.__typename === 'EthCallSpec' &&
    dataSourceSpec?.sourceType.sourceType;

  return (
    <>
      <Stats.MarkPriceStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Stats.Last24hPriceChangeStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Stats.Last24hVolumeChangeStat
        marketId={market.id}
        marketDecimalPlaces={market.decimalPlaces}
        positionDecimalPlaces={market.positionDecimalPlaces}
        quoteUnit={quoteUnit}
      />
      <HeaderStatMarketTradingMode
        marketId={market.id}
        initialTradingMode={market.tradingMode}
      />
      <MarketState market={market} />
      <Stats.AssetStat
        heading={t('Settlement asset')}
        asset={asset}
        data-testid="market-settlement-asset"
      />
      <MarketLiquiditySupplied
        marketId={market.id}
        assetDecimals={asset?.decimals || 0}
        quantum={asset.quantum}
      />
      <HeaderStat
        heading={`${t('Funding Rate')} / ${t('Countdown')}`}
        data-testid="market-funding"
      >
        <div className="flex gap-2">
          <FundingRate marketId={market.id} />
          <FundingCountdown marketId={market.id} />
        </div>
      </HeaderStat>
      <HeaderStat
        heading={`${t('Index Price')}`}
        description={
          <div className="p1">
            {t(
              'The external time weighted average price (TWAP) received from the data source defined in the data sourcing specification.'
            )}
            {DocsLinks && (
              <ExternalLink href={DocsLinks.ETH_DATA_SOURCES} className="mt-2">
                {t('Find out more')}
              </ExternalLink>
            )}
          </div>
        }
        data-testid="index-price"
      >
        <IndexPrice
          marketId={market.id}
          decimalPlaces={
            market.tradableInstrument.instrument.product.settlementAsset
              .decimals
          }
        />
      </HeaderStat>
    </>
  );
};

export const FundingRate = ({ marketId }: { marketId: string }) => {
  const { data: fundingRate } = useFundingRate(marketId);
  return (
    <div data-testid="funding-rate">
      {fundingRate ? `${(Number(fundingRate) * 100).toFixed(4)}%` : '-'}
    </div>
  );
};

export const IndexPrice = ({
  marketId,
  decimalPlaces,
}: {
  marketId: string;
  decimalPlaces?: number;
}) => {
  const { data: externalTwap } = useExternalTwap(marketId);
  return externalTwap && decimalPlaces ? (
    <PriceCell
      value={Number(externalTwap)}
      valueFormatted={addDecimalsFormatNumber(externalTwap, decimalPlaces)}
    />
  ) : (
    '-'
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
  const { data: marketInfo } = useDataProvider({
    dataProvider: marketInfoProvider,
    variables: { marketId },
    skip,
  });
  let every: number | undefined = undefined;
  const sourceType =
    marketInfo &&
    getDataSourceSpecForSettlementSchedule(
      marketInfo.tradableInstrument.instrument.product
    )?.data.sourceType.sourceType;

  if (sourceType?.__typename === 'DataSourceSpecConfigurationTimeTrigger') {
    every = sourceType.triggers?.[0]?.every ?? undefined;
    if (every) {
      every *= 1000;
    }
  }
  return every;
};

const useStartTime = (marketId: string, skip: boolean) => {
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

export const FundingCountdown = ({ marketId }: { marketId: string }) => {
  const now = useNow();
  const { data: marketTradingMode } = useMarketTradingMode(marketId);
  const skip = !marketTradingMode || isMarketInAuction(marketTradingMode);
  const startTime = useStartTime(marketId, skip);
  const every = useEvery(marketId, skip);

  return (
    <div data-testid="funding-countdown">
      {useFormatCountdown(now, startTime, every)}
    </div>
  );
};
