import type { ApolloError } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import throttle from 'lodash/throttle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { updateDepthUpdate } from '../helpers';
import {
  MARKET_DEPTH_QUERY,
  MARKET_DEPTH_UPDATE_SUB,
} from '../queries/market-depth';
import type {
  marketDepth,
  marketDepthVariables,
} from '../__generated__/marketDepth';
import type {
  marketDepthUpdateSubscribe,
  marketDepthUpdateSubscribeVariables,
} from '../__generated__/marketDepthUpdateSubscribe';

export interface QueryResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error?: ApolloError;
}

export function useDepthUpdate({ marketId }: marketDepthVariables, wait = 0) {
  const queryResultRef = useRef<QueryResult<marketDepth>>({
    data: undefined,
    loading: true,
    error: undefined,
  });

  const [queryResult, setQueryResult] = useState<QueryResult<marketDepth>>({
    data: undefined,
    loading: true,
    error: undefined,
  });

  const sequenceNumber = useRef<null | number>(null);
  const [stallCount, setStallCount] = useState(0);

  const client = useApolloClient();

  const handleUpdate = useMemo(
    () => throttle(setQueryResult, wait, { leading: true }),
    [wait]
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, loading, error } = await client.query<
        marketDepth,
        marketDepthVariables
      >({
        query: MARKET_DEPTH_QUERY,
        variables: { marketId },
        fetchPolicy: 'no-cache',
      });

      if (data.market?.depth.sequenceNumber) {
        sequenceNumber.current = Number.parseInt(
          data.market?.depth.sequenceNumber
        );

        queryResultRef.current = { data, loading, error };
        handleUpdate({ data, loading, error });
      }
    };

    fetchData();
  }, [client, handleUpdate, marketId, stallCount]);

  useEffect(() => {
    if (!marketId) return;

    const result = client.subscribe<
      marketDepthUpdateSubscribe,
      marketDepthUpdateSubscribeVariables
    >({
      query: MARKET_DEPTH_UPDATE_SUB,
      variables: { marketId },
      fetchPolicy: 'no-cache',
      errorPolicy: 'none',
    });

    const subscription = result.subscribe((result) => {
      const prev = queryResultRef.current.data;
      const subscriptionData = result;

      if (
        !prev ||
        !subscriptionData.data ||
        subscriptionData.data?.marketDepthUpdate?.market?.id !== prev.market?.id
      ) {
        return;
      }

      const nextSequenceNumber = Number.parseInt(
        subscriptionData.data.marketDepthUpdate.sequenceNumber
      );

      if (
        prev.market &&
        subscriptionData.data?.marketDepthUpdate &&
        sequenceNumber.current !== null &&
        nextSequenceNumber !== sequenceNumber.current + 1
      ) {
        console.log(
          `Refetching: Expected ${
            sequenceNumber.current + 1
          } but got ${nextSequenceNumber}`
        );

        sequenceNumber.current = null;

        // Trigger refetch
        setStallCount((count) => count + 1);

        return;
      }

      sequenceNumber.current = nextSequenceNumber;

      const depth = updateDepthUpdate(prev, { data: subscriptionData.data });

      queryResultRef.current.data = depth;
      handleUpdate({ data: depth, loading: false });
    });

    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [client, handleUpdate, marketId]);

  return queryResult;
}
