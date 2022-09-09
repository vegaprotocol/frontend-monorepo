import { DepthChart } from 'pennant';
import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  useDataProvider,
  addDecimal,
  ThemeContext,
  getNumberFormat,
} from '@vegaprotocol/react-helpers';
import dataProvider from './market-depth-data-provider';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react';
import type {
  MarketDepthQuery,
  MarketDepthEventSubscription,
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
  const theme = useContext(ThemeContext);
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [decimalPlaces, setDecimalPlaces] = useState<number>(0);
  const [positionDecimalPlaces, setPositionDecimalPlaces] = useState<number>(0);
  const dataRef = useRef<DepthData | null>(null);
  const setDepthDataThrottledRef = useRef(throttle(setDepthData, 1000));

  // Apply updates to the table
  const update = useCallback(
    ({
      delta,
    }: {
      delta: MarketDepthEventSubscription['marketDepthUpdate'];
    }) => {
      if (!dataRef.current) {
        return false;
      }
      dataRef.current = {
        ...dataRef.current,
        midPrice: delta.market.data?.staticMidPrice
          ? formatMidPrice(delta.market.data?.staticMidPrice, decimalPlaces)
          : undefined,
        data: {
          buy: delta.buy
            ? updateLevels(
                dataRef.current.data.buy,
                delta.buy,
                decimalPlaces,
                positionDecimalPlaces,
                true
              )
            : dataRef.current.data.buy,
          sell: delta.sell
            ? updateLevels(
                dataRef.current.data.sell,
                delta.sell,
                decimalPlaces,
                positionDecimalPlaces
              )
            : dataRef.current.data.sell,
        },
      };
      setDepthDataThrottledRef.current(dataRef.current);
      return true;
    },
    [decimalPlaces, positionDecimalPlaces]
  );

  const { data, error, loading } = useDataProvider<
    MarketDepthQuery['market'],
    MarketDepthEventSubscription['marketDepthUpdate']
  >({
    dataProvider,
    update,
    variables,
  });

  useEffect(() => {
    if (!data) {
      dataRef.current = null;
      setDepthData(dataRef.current);
      return;
    }
    dataRef.current = {
      midPrice: data.data?.staticMidPrice
        ? formatMidPrice(data.data?.staticMidPrice, data.decimalPlaces)
        : undefined,
      data: {
        buy:
          data.depth.buy?.map((priceLevel) =>
            parseLevel(
              priceLevel,
              data.decimalPlaces,
              data.positionDecimalPlaces
            )
          ) ?? [],
        sell:
          data.depth.sell?.map((priceLevel) =>
            parseLevel(
              priceLevel,
              data.decimalPlaces,
              data.positionDecimalPlaces
            )
          ) ?? [],
      },
    };
    setDepthData(dataRef.current);
    setDecimalPlaces(data.decimalPlaces);
    setPositionDecimalPlaces(data.positionDecimalPlaces);
  }, [data]);

  const volumeFormat = useCallback(
    (volume: number) =>
      getNumberFormat(data?.positionDecimalPlaces || 0).format(volume),
    [data?.positionDecimalPlaces]
  );

  const priceFormat = useCallback(
    (price: number) => getNumberFormat(data?.decimalPlaces || 0).format(price),
    [data?.decimalPlaces]
  );

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
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
