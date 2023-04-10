import React from 'react';
import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { addDecimal } from '@vegaprotocol/utils';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthProvider } from './market-depth-provider';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import type { MarketData } from '@vegaprotocol/market-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  MarketDepthUpdateSubscription,
  MarketDepthQuery,
  MarketDepthQueryVariables,
} from './__generated__/MarketDepth';
import type { PriceLevelFieldsFragment } from './__generated__/MarketDepth';
import {
  compactRows,
  updateCompactedRows,
  getMidPrice,
  getPriceLevel,
} from './orderbook-data';
import type { OrderbookData } from './orderbook-data';
import { useOrderStore } from '@vegaprotocol/orders';

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
  const [resolution, setResolution] = useState(1);
  const variables = { marketId };
  const resolutionRef = useRef(resolution);
  const [orderbookData, setOrderbookData] = useState<OrderbookData>({
    rows: null,
  });
  const dataRef = useRef<OrderbookData>({ rows: null });
  const marketDataRef = useRef<MarketData | null>(null);
  const rawDataRef = useRef<MarketDepthQuery['market'] | null>(null);
  const deltaRef = useRef<{
    sell: PriceLevelFieldsFragment[];
    buy: PriceLevelFieldsFragment[];
  }>({
    sell: [],
    buy: [],
  });
  const updateOrderbookData = useRef(
    throttle(() => {
      dataRef.current = {
        ...marketDataRef.current,
        indicativePrice:
          marketDataRef.current?.indicativePrice &&
          getPriceLevel(
            marketDataRef.current.indicativePrice,
            resolutionRef.current
          ),
        midPrice: getMidPrice(
          rawDataRef.current?.depth.sell,
          rawDataRef.current?.depth.buy,
          resolution
        ),
        rows:
          deltaRef.current.buy.length || deltaRef.current.sell.length
            ? updateCompactedRows(
                dataRef.current.rows ?? [],
                deltaRef.current.sell,
                deltaRef.current.buy,
                resolutionRef.current
              )
            : dataRef.current.rows,
      };
      deltaRef.current.buy = [];
      deltaRef.current.sell = [];
      setOrderbookData(dataRef.current);
    }, 250)
  );

  useEffect(() => {
    deltaRef.current.buy = [];
    deltaRef.current.sell = [];
  }, [marketId]);

  const update = useCallback(
    ({
      delta: deltas,
      data: rawData,
    }: {
      delta?: MarketDepthUpdateSubscription['marketsDepthUpdate'] | null;
      data: NonNullable<MarketDepthQuery['market']> | null | undefined;
    }) => {
      if (!dataRef.current.rows) {
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
        updateOrderbookData.current();
      }
      return true;
    },
    [marketId, updateOrderbookData]
  );

  const { data, error, loading, flush, reload } = useDataProvider<
    MarketDepthQuery['market'] | undefined,
    MarketDepthUpdateSubscription['marketsDepthUpdate'] | null,
    MarketDepthQueryVariables
  >({
    dataProvider: marketDepthProvider,
    update,
    variables,
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

  const marketDataUpdate = useCallback(
    ({ data }: { data: MarketData | null }) => {
      marketDataRef.current = data;
      updateOrderbookData.current();
      return true;
    },
    []
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
    const throttleRunner = updateOrderbookData.current;
    if (!data) {
      dataRef.current = { rows: null };
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = {
      ...marketDataRef.current,
      indicativePrice:
        marketDataRef.current?.indicativePrice &&
        getPriceLevel(marketDataRef.current.indicativePrice, resolution),
      midPrice: getMidPrice(data.depth.sell, data.depth.buy, resolution),
      rows: compactRows(data.depth.sell, data.depth.buy, resolution),
    };
    rawDataRef.current = data;
    setOrderbookData(dataRef.current);

    return () => {
      throttleRunner.cancel();
    };
  }, [data, resolution]);

  useEffect(() => {
    resolutionRef.current = resolution;
    flush();
  }, [resolution, flush]);

  const updateOrder = useOrderStore((store) => store.update);

  return (
    <AsyncRenderer
      loading={loading || marketDataLoading || marketLoading}
      error={error || marketDataError || marketError}
      data={data}
      reload={reload}
    >
      <Orderbook
        {...orderbookData}
        decimalPlaces={market?.decimalPlaces ?? 0}
        positionDecimalPlaces={market?.positionDecimalPlaces ?? 0}
        resolution={resolution}
        onResolutionChange={(resolution: number) => setResolution(resolution)}
        onClick={(priceValue: string) => {
          if (priceValue) {
            updateOrder(marketId, { price: priceValue.toString() });
          }
        }}
      />
    </AsyncRenderer>
  );
};
