import { useCallback, useMemo, useState } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  NetworkParams,
  t,
  useDataProvider,
  useNetworkParams,
} from '@vegaprotocol/react-helpers';
import type {
  MarketData,
  MarketDataUpdateFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import { Indicator, Link } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useCheckLiquidityStatus } from '@vegaprotocol/liquidity';
import { DataGrid } from '@vegaprotocol/react-helpers';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';

interface Props {
  marketId?: string;
  noUpdate?: boolean;
  assetDecimals: number;
}

export const MarketLiquiditySupplied = ({
  marketId,
  assetDecimals,
  noUpdate = false,
}: Props) => {
  const [market, setMarket] = useState<MarketData>();
  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);

  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;
  const triggeringRatio = Number(
    params.market_liquidity_targetstake_triggering_ratio
  );

  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  const { data } = useDataProvider<SingleMarketFieldsFragment, never>({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (!noUpdate && marketData) {
        setMarket(marketData);
      }
      return true;
    },
    [noUpdate]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: noUpdate || !marketId || !data,
  });

  const supplied = market?.suppliedStake
    ? addDecimalsFormatNumber(
        new BigNumber(market?.suppliedStake)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '-';

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: market?.suppliedStake || 0,
    targetStake: market?.targetStake || 0,
    triggeringRatio,
  });

  const compiledGrid = [
    {
      label: t('Supplied stake'),
      value: market?.suppliedStake
        ? addDecimalsFormatNumber(
            new BigNumber(market?.suppliedStake).toString(),
            assetDecimals
          )
        : '-',
    },
    {
      label: t('Target stake'),
      value: market?.targetStake
        ? addDecimalsFormatNumber(
            new BigNumber(market?.targetStake).toString(),
            assetDecimals
          )
        : '-',
    },
  ];

  const showMessage =
    percentage.gte(100) &&
    market?.marketTradingMode ===
      MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    market.trigger === AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

  const description = (
    <section>
      {compiledGrid && <DataGrid grid={compiledGrid} />}
      <br />
      <Link href={`/#/liquidity/${marketId}`} data-testid="view-liquidity-link">
        {t('View liquidity provision table')}
      </Link>
      {showMessage && (
        <p className="mt-4">
          {t(
            'The market is in an auction because there are no priced limit orders, which are required to deploy liquidity commitment pegged orders. This means the order book is empty on one or both sides.'
          )}
        </p>
      )}
    </section>
  );

  return (
    <HeaderStat
      heading={t('Liquidity supplied')}
      description={description}
      testId="liquidity-supplied"
    >
      <Indicator variant={status} />
      {supplied} (
      {percentage.gt(100) ? '>100%' : formatNumberPercentage(percentage, 2)})
    </HeaderStat>
  );
};
