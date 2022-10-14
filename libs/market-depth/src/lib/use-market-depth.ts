import { useCallback, useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import dataProvider from './market-depth-provider';
import type { MarketDepth_market } from './__generated__/MarketDepth';

interface Props {
  variables: { marketId: string };
  throttleMilliseconds?: number;
}

export const useMarketDepth = ({
  variables,
  throttleMilliseconds = 1000,
}: Props) => {
  const [marketDepthData, setMarketDepthData] =
    useState<MarketDepth_market | null>(null);
  const dataRef = useRef<MarketDepth_market | null>(null);
  const updateMarketDepthData = useRef(
    throttle(() => {
      if (!dataRef.current) {
        return;
      }
      setMarketDepthData(dataRef.current);
    }, throttleMilliseconds)
  );

  const update = useCallback(
    ({ data }: { data: MarketDepth_market | null }) => {
      if (!data) {
        return false;
      }
      dataRef.current = data;
      updateMarketDepthData.current();
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
    const throttleRunnner = updateMarketDepthData.current;
    if (!data) {
      dataRef.current = null;
      setMarketDepthData(dataRef.current);
      return;
    }
    dataRef.current = {
      ...data,
    };
    setMarketDepthData(dataRef.current);
    return () => {
      throttleRunnner.cancel();
    };
  }, [data]);

  return {
    loading,
    error,
    data: marketDepthData,
  };
};
