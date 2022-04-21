import { DepthChart } from 'pennant';
import { produce } from 'immer';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  useDataProvider,
  addDecimal,
  ThemeContext,
} from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from '@vegaprotocol/orderbook';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react';
import type {
  MarketDepth_market_depth_buy,
  MarketDepth_market_depth_sell,
  MarketDepthSubscription_marketDepthUpdate_buy,
  MarketDepthSubscription_marketDepthUpdate_sell,
  MarketDepthSubscription_marketDepthUpdate,
} from '@vegaprotocol/orderbook';
import type { DepthChartProps } from 'pennant';

interface DepthChartManagerProps {
  marketId: string;
}

interface PriceLevel {
  price: number;
  volume: number;
}

const formatLevel = (
  priceLevel: MarketDepth_market_depth_buy | MarketDepth_market_depth_sell,
  decimalPlaces: number
): PriceLevel => ({
  price: Number(addDecimal(priceLevel.price, decimalPlaces)),
  volume: Number(priceLevel.volume),
});

const updateLevels = (
  levels: PriceLevel[],
  updates: (
    | MarketDepthSubscription_marketDepthUpdate_buy
    | MarketDepthSubscription_marketDepthUpdate_sell
  )[],
  decimalPlaces: number
) => {
  updates.forEach((update) => {
    const updateLevel = formatLevel(update, decimalPlaces);
    let index = levels.findIndex((level) => level.price === updateLevel.price);
    if (index !== -1) {
      if (update.volume === '0') {
        levels.splice(index, 1);
      } else {
        Object.assign(levels[index], updateLevel);
      }
    } else if (update.volume !== '0') {
      index = levels.findIndex((level) => level.price > updateLevel.price);
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

export const DepthChartContainer = ({ marketId }: DepthChartManagerProps) => {
  const theme = useContext(ThemeContext);
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const lastUpdateRef = useRef(new Date().getTime());
  const [depthData, setDepthData] = useState<DepthChartProps['data'] | null>(
    null
  );
  const [midPrice, setMidPrice] = useState<number | undefined>(undefined);
  const decimalPlacesRef = useRef<number>(0);
  const dataRef = useRef<DepthChartProps['data'] | null>(null);

  // Apply updates to the table
  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      if (!dataRef.current) {
        return false;
      }
      dataRef.current = produce(dataRef.current, (draft) => {
        if (delta.buy) {
          draft.buy = updateLevels(
            draft.buy,
            delta.buy,
            decimalPlacesRef.current
          );
        }
        if (delta.sell) {
          draft.sell = updateLevels(
            draft.sell,
            delta.sell,
            decimalPlacesRef.current
          );
        }
      });
      const now = new Date().getTime();
      if (now - lastUpdateRef.current > 1000) {
        setDepthData(dataRef.current);
        setMidPrice(
          delta.market.data?.midPrice
            ? formatMidPrice(
                delta.market.data?.midPrice,
                decimalPlacesRef.current
              )
            : undefined
        );
        lastUpdateRef.current = now;
      }
      return true;
    },
    []
  );

  const { data, error, loading } = useDataProvider(
    marketDepthDataProvider,
    update,
    variables
  );

  useEffect(() => {
    if (!data) {
      dataRef.current = null;
      setDepthData(dataRef.current);
      return;
    }
    dataRef.current = {
      buy:
        data.depth.buy?.map((priceLevel) =>
          formatLevel(priceLevel, data.decimalPlaces)
        ) ?? [],
      sell:
        data.depth.sell?.map((priceLevel) =>
          formatLevel(priceLevel, data.decimalPlaces)
        ) ?? [],
    };
    setDepthData(dataRef.current);
    setMidPrice(
      data.data?.midPrice
        ? formatMidPrice(data.data?.midPrice, data.decimalPlaces)
        : undefined
    );
    decimalPlacesRef.current = data.decimalPlaces;
  }, [data]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {depthData && (
        <DepthChart data={depthData} midPrice={midPrice} theme={theme} />
      )}
    </AsyncRenderer>
  );
};
