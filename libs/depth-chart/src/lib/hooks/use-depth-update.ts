import type { ApolloError } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import sortBy from 'lodash/sortby';
import throttle from 'lodash/throttle';
import * as React from 'react';
import {
  marketDepthQuery,
  marketDepthUpdateSubscription,
} from '../queries/market-depth';
import type {
  marketDepth,
  marketDepthVariables,
  marketDepth_market_depth,
} from '../__generated__/marketDepth';
import type {
  marketDepthUpdateSubscribe,
  marketDepthUpdateSubscribeVariables,
} from '../__generated__/marketDepthUpdateSubscribe';

export function updateDepthUpdate(
  prev: marketDepth,
  subscriptionData: { data: marketDepthUpdateSubscribe }
): marketDepth {
  if (!subscriptionData.data.marketDepthUpdate || !prev.market) {
    return prev;
  }

  return {
    ...prev,
    market: {
      ...prev.market,
      ...(prev.market.data && {
        data: {
          ...prev.market.data,
          midPrice:
            subscriptionData.data.marketDepthUpdate.market.data?.midPrice ??
            prev.market.data.midPrice,
        },
      }),
      depth: {
        ...prev.market.depth,
        ...merge(prev.market.depth, subscriptionData.data.marketDepthUpdate),
      },
    },
  };
}

type MarketDepth = Pick<marketDepth_market_depth, 'buy' | 'sell'>;

function merge(snapshot: MarketDepth, update: MarketDepth): MarketDepth {
  let buy = snapshot.buy ? [...snapshot.buy] : null;
  let sell = snapshot.sell ? [...snapshot.sell] : null;

  if (buy !== null) {
    if (update.buy !== null) {
      for (const priceLevel of update.buy) {
        const index = buy.findIndex(
          (level) => level.price === priceLevel.price
        );

        if (index !== -1) {
          if (priceLevel.volume !== '0') {
            buy.splice(index, 1, priceLevel);
          } else {
            buy.splice(index, 1);
          }
        } else {
          buy.push(priceLevel);
        }
      }
    }
  } else {
    buy = update.buy;
  }

  if (sell !== null) {
    if (update.sell !== null) {
      for (const priceLevel of update.sell) {
        const index = sell.findIndex(
          (level) => level.price === priceLevel.price
        );

        if (index !== -1) {
          if (priceLevel.volume !== '0') {
            sell.splice(index, 1, priceLevel);
          } else {
            sell.splice(index, 1);
          }
        } else {
          sell.push(priceLevel);
        }
      }
    }
  } else {
    sell = update.sell;
  }

  return {
    buy: sortBy(buy, (d) => -parseInt(d.price)),
    sell: sortBy(sell, (d) => parseInt(d.price)),
  };
}

export interface QueryResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error?: ApolloError;
}

export function useDepthUpdate({ marketId }: marketDepthVariables, wait = 0) {
  const queryResultRef = React.useRef<QueryResult<marketDepth>>({
    data: undefined,
    loading: true,
    error: undefined,
  });

  const [queryResult, setQueryResult] = React.useState<
    QueryResult<marketDepth>
  >({
    data: undefined,
    loading: true,
    error: undefined,
  });

  const sequenceNumber = React.useRef<null | number>(null);
  const [stallCount, setStallCount] = React.useState(0);

  const client = useApolloClient();

  const handleUpdate = React.useMemo(
    () => throttle(setQueryResult, wait, { leading: true }),
    [wait]
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const { data, loading, error } = await client.query<
        marketDepth,
        marketDepthVariables
      >({
        query: marketDepthQuery,
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

  React.useEffect(() => {
    if (!marketId) return;

    const result = client.subscribe<
      marketDepthUpdateSubscribe,
      marketDepthUpdateSubscribeVariables
    >({
      query: marketDepthUpdateSubscription,
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
