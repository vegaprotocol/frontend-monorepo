import { useCallback, useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import dataProvider from './market-depth-provider';
import type { MarketDepthQuery } from './__generated___/MarketDepth';

interface Props {
  variables: { marketId: string };
  throttleMilliseconds?: number;
}

export const useOrderBookData = ({
  variables,
  throttleMilliseconds = 1000,
}: Props) => {
  const [orderbookData, setOrderbookData] = useState<
    MarketDepthQuery['market'] | null
  >(null);
  const dataRef = useRef<MarketDepthQuery['market'] | null>(null);
  const updateOrderbookData = useRef(
    throttle(() => {
      if (!dataRef.current) {
        return;
      }
      setOrderbookData(dataRef.current);
    }, throttleMilliseconds)
  );

  const update = useCallback(
    ({ data }: { data: MarketDepthQuery['market'] | null }) => {
      if (!data) {
        return false;
      }
      dataRef.current = data;
      updateOrderbookData.current();
      return true;
    },
    []
  );

  const { data, error, loading } = useDataProvider({
    dataProvider,
    update,
    variables,
  });

  useEffect(() => {
    const throttleRunnner = updateOrderbookData.current;
    if (!data) {
      dataRef.current = null;
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = {
      ...data,
    };
    setOrderbookData(dataRef.current);
    return () => {
      throttleRunnner.cancel();
    };
  }, [data]);

  return {
    loading,
    error,
    data: orderbookData,
  };
};
