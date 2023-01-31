import { DepthChart } from 'pennant';
import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  useDataProvider,
  addDecimal,
  getNumberFormat,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import { marketDepthProvider } from './market-depth-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import type { MarketData } from '@vegaprotocol/market-list';
import type {
  MarketDepthUpdateSubscription,
  PriceLevelFieldsFragment,
} from './__generated__/MarketDepth';
import type { DepthChartProps } from 'pennant';
import { parseLevel, updateLevels } from './depth-chart-utils';

interface DepthChartManagerProps {
  marketId: string;
}

const formatMidPrice = (midPrice: string, decimalPlaces: number) =>
  Number(addDecimal(midPrice, decimalPlaces));

type DepthData = Pick<DepthChartProps, 'data' | 'midPrice'>;

export const DepthChartContainer = ({ marketId }: DepthChartManagerProps) => {
  const { theme } = useThemeSwitcher();
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const dataRef = useRef<DepthData | null>(null);
  const marketDataRef = useRef<MarketData | null>(null);
  const deltaRef = useRef<{
    sell: PriceLevelFieldsFragment[];
    buy: PriceLevelFieldsFragment[];
  }>({
    sell: [],
    buy: [],
  });

  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useDataProvider({
    dataProvider: marketProvider,
    skipUpdates: true,
    variables,
  });

  const updateDepthData = useMemo(
    () =>
      throttle(() => {
        if (!dataRef.current || !marketDataRef.current || !market) {
          return;
        }
        dataRef.current = {
          ...dataRef.current,
          midPrice: marketDataRef.current?.staticMidPrice
            ? formatMidPrice(
                marketDataRef.current?.staticMidPrice,
                market.decimalPlaces
              )
            : undefined,
          data: {
            buy: deltaRef.current.buy
              ? updateLevels(
                  dataRef.current.data.buy,
                  deltaRef.current.buy,
                  market.decimalPlaces,
                  market.positionDecimalPlaces,
                  true
                )
              : dataRef.current.data.buy,
            sell: deltaRef.current.sell
              ? updateLevels(
                  dataRef.current.data.sell,
                  deltaRef.current.sell,
                  market.decimalPlaces,
                  market.positionDecimalPlaces
                )
              : dataRef.current.data.sell,
          },
        };
        deltaRef.current.buy = [];
        deltaRef.current.sell = [];
        setDepthData(dataRef.current);
      }, 1000),
    [market]
  );

  // Apply updates to the table
  const update = useCallback(
    ({
      delta: deltas,
    }: {
      delta?: MarketDepthUpdateSubscription['marketsDepthUpdate'];
    }) => {
      if (!dataRef.current) {
        return false;
      }
      for (const delta of deltas || []) {
        if (delta.marketId !== marketId) {
          continue;
        }
        if (delta.sell) {
          deltaRef.current.sell.push(...delta.sell);
        }
        if (delta.buy) {
          deltaRef.current.buy.push(...delta.buy);
        }
        updateDepthData();
      }
      return true;
    },
    [marketId, updateDepthData]
  );

  const { data, error, loading } = useDataProvider({
    dataProvider: marketDepthProvider,
    update,
    variables,
  });

  const marketDataUpdate = useCallback(
    ({ data }: { data: MarketData | null }) => {
      marketDataRef.current = data;
      updateDepthData();
      return true;
    },
    [updateDepthData]
  );

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
  } = useDataProvider({
    dataProvider: marketDataProvider,
    update: marketDataUpdate,
    variables,
  });

  if (!marketDataRef.current && marketData) {
    marketDataRef.current = marketData;
  }

  useEffect(() => {
    if (!marketData || !market || !data) {
      return;
    }
    if (!data) {
      dataRef.current = null;
      setDepthData(dataRef.current);
      return;
    }
    dataRef.current = {
      midPrice: marketData.staticMidPrice
        ? formatMidPrice(marketData.staticMidPrice, market.decimalPlaces)
        : undefined,
      data: {
        buy:
          data.depth.buy?.map((priceLevel) =>
            parseLevel(
              priceLevel,
              market.decimalPlaces,
              market.positionDecimalPlaces
            )
          ) ?? [],
        sell:
          data.depth.sell?.map((priceLevel) =>
            parseLevel(
              priceLevel,
              market.decimalPlaces,
              market.positionDecimalPlaces
            )
          ) ?? [],
      },
    };
    setDepthData(dataRef.current);
  }, [data, marketData, market]);

  const volumeFormat = useCallback(
    (volume: number) =>
      getNumberFormat(market?.positionDecimalPlaces || 0).format(volume),
    [market?.positionDecimalPlaces]
  );

  const priceFormat = useCallback(
    (price: number) =>
      getNumberFormat(market?.decimalPlaces || 0).format(price),
    [market?.decimalPlaces]
  );

  return (
    <AsyncRenderer
      loading={loading || marketLoading || marketDataLoading}
      error={error || marketError || marketDataError}
      data={data}
    >
      {depthData && (
        <DepthChart
          {...depthData}
          theme={theme}
          volumeFormat={volumeFormat}
          priceFormat={priceFormat}
        />
      )}
    </AsyncRenderer>
  );
};
