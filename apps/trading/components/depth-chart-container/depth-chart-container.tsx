import { DepthChart, type DepthChartProps } from 'pennant';
import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { addDecimal, formatNumber } from '@vegaprotocol/utils';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  marketDepthProvider,
  parseLevel,
  updateLevels,
  type MarketDepthQuery,
  type MarketDepthUpdateSubscription,
  type PriceLevelFieldsFragment,
} from '@vegaprotocol/market-depth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMarket } from '../../lib/hooks/use-markets';
import { useT } from '../../lib/use-t';

interface DepthChartManagerProps {
  marketId: string;
}

const formatMidPrice = (midPrice: string, decimalPlaces: number) =>
  Number(addDecimal(midPrice, decimalPlaces));

const getMidPrice = (
  sell: PriceLevelFieldsFragment[] | null | undefined,
  buy: PriceLevelFieldsFragment[] | null | undefined,
  decimalPlaces: number
) =>
  buy?.length && sell?.length
    ? formatMidPrice(
        ((BigInt(buy[0].price) + BigInt(sell[0].price)) / BigInt(2)).toString(),
        decimalPlaces
      )
    : undefined;

type DepthData = Pick<DepthChartProps, 'data' | 'midPrice'>;

export const DepthChartContainer = ({ marketId }: DepthChartManagerProps) => {
  const t = useT();
  const { theme } = useThemeSwitcher();
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const dataRef = useRef<DepthData | null>(null);
  const rawDataRef = useRef<MarketDepthQuery['market'] | null>(null);
  const deltaRef = useRef<{
    sell: PriceLevelFieldsFragment[];
    buy: PriceLevelFieldsFragment[];
  }>({
    sell: [],
    buy: [],
  });

  const {
    data: market,
    isLoading: marketLoading,
    error: marketError,
  } = useMarket({ marketId });

  const updateDepthData = useMemo(
    () =>
      throttle(() => {
        if (!dataRef.current || !market || !market?.data) {
          return;
        }
        dataRef.current = {
          ...dataRef.current,
          midPrice: getMidPrice(
            rawDataRef.current?.depth.sell,
            rawDataRef.current?.depth.buy,
            market.decimalPlaces
          ),
          data: {
            buy: deltaRef.current.buy.length
              ? updateLevels(
                  dataRef.current.data.buy,
                  deltaRef.current.buy,
                  market.decimalPlaces,
                  market.positionDecimalPlaces,
                  false
                )
              : dataRef.current.data.buy,
            sell: deltaRef.current.sell.length
              ? updateLevels(
                  dataRef.current.data.sell,
                  deltaRef.current.sell,
                  market.decimalPlaces,
                  market.positionDecimalPlaces,
                  true
                )
              : dataRef.current.data.sell,
          },
        };
        deltaRef.current.buy = [];
        deltaRef.current.sell = [];
        setDepthData(dataRef.current);
      }, 250),
    [market]
  );

  useEffect(() => {
    deltaRef.current.buy = [];
    deltaRef.current.sell = [];
  }, [marketId]);

  // Apply updates to the table
  const update = useCallback(
    ({
      delta: deltas,
      data: rawData,
    }: {
      delta?: MarketDepthUpdateSubscription['marketsDepthUpdate'] | null;
      data: NonNullable<MarketDepthQuery['market']> | null;
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
        rawDataRef.current = rawData;
        updateDepthData();
      }
      return true;
    },
    [marketId, updateDepthData]
  );

  const { data, error, loading } = useDataProvider<
    NonNullable<MarketDepthQuery['market']> | null,
    MarketDepthUpdateSubscription['marketsDepthUpdate'],
    { marketId: string }
  >({
    dataProvider: marketDepthProvider,
    update,
    variables,
  });

  useEffect(() => {
    if (!market || !data) {
      return;
    }
    if (!data) {
      dataRef.current = null;
      setDepthData(dataRef.current);
      return;
    }
    dataRef.current = {
      midPrice: getMidPrice(
        data.depth.sell,
        data.depth.buy,
        market.decimalPlaces
      ),
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
    rawDataRef.current = data;
    setDepthData(dataRef.current);
    return () => {
      updateDepthData.cancel();
    };
  }, [data, market, updateDepthData]);

  const volumeFormat = useCallback(
    (volume: number) =>
      formatNumber(volume, market?.positionDecimalPlaces || 0),
    [market?.positionDecimalPlaces]
  );

  const priceFormat = useCallback(
    (price: number) => formatNumber(price, market?.decimalPlaces || 0),
    [market?.decimalPlaces]
  );

  return (
    <AsyncRenderer
      loading={loading || marketLoading}
      error={error || marketError}
      data={data}
    >
      {depthData && (
        <DepthChart
          {...depthData}
          theme={theme}
          volumeFormat={volumeFormat}
          priceFormat={priceFormat}
          notEnoughDataText={
            <span className="text-center text-xs">{t('No data')}</span>
          }
        />
      )}
    </AsyncRenderer>
  );
};
