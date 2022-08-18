import { DepthChart } from 'pennant';
import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  useDataProvider,
  addDecimal,
  addDecimalsFormatNumber,
  ThemeContext,
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
  MarketDepthSubscription_marketDepthUpdate_buy,
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate,
} from './__generated__/MarketDepthSubscription';
import type {
  MarketDepth_market_depth_buy,
  MarketDepth_market_depth_sell,
} from './__generated__/MarketDepth';
import type { DepthChartProps } from 'pennant';

interface DepthChartManagerProps {
  marketId: string;
}

interface PriceLevel {
  price: number;
  volume: number;
}

const parseLevel = (
  priceLevel: MarketDepth_market_depth_buy | MarketDepth_market_depth_sell,
  priceDecimalPlaces = 0,
  volumeDecimalPlaces = 0
): PriceLevel => ({
  price: Number(addDecimal(priceLevel.price, priceDecimalPlaces)),
  volume: Number(addDecimal(priceLevel.volume, volumeDecimalPlaces)),
});

const updateLevels = (
  levels: PriceLevel[],
  updates: (
    | MarketDepthSubscription_marketDepthUpdate_buy
    | MarketDepthSubscription_marketDepthUpdate_sell
  )[],
  decimalPlaces: number,
  positionDecimalPlaces: number,
  reverse = false
) => {
  updates.forEach((update) => {
    const updateLevel = parseLevel(
      update,
      decimalPlaces,
      positionDecimalPlaces
    );
    let index = levels.findIndex((level) => level.price === updateLevel.price);
    if (index !== -1) {
      if (update.volume === '0') {
        levels.splice(index, 1);
      } else {
        Object.assign(levels[index], updateLevel);
      }
    } else if (update.volume !== '0') {
      index = levels.findIndex((level) =>
        reverse
          ? level.price < updateLevel.price
          : level.price > updateLevel.price
      );
      if (index !== -1) {
        levels.splice(index, 0, updateLevel);
      } else {
        levels.push(updateLevel);
      }
    }
  });
  return levels;
};

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
    ({ delta }: { delta: MarketDepthSubscription_marketDepthUpdate }) => {
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

  const { data, error, loading } = useDataProvider({
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

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {depthData && (
        <DepthChart
          {...depthData}
          theme={theme}
          volumeFormat={(volume) =>
            addDecimalsFormatNumber(volume, data?.positionDecimalPlaces || 0)
          }
          priceFormat={(price) =>
            addDecimalsFormatNumber(price, data?.decimalPlaces || 0)
          }
        />
      )}
    </AsyncRenderer>
  );
};
