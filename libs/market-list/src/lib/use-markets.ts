import { useYesterday } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import type {
  MarketHookDataFragment,
  MarketHookQuery,
  MarketsDataHookSubscription,
  MarketsDataHookSubscriptionVariables,
} from './__generated__/MarketsHooks';
import {
  MarketsDataHookDocument,
  useMarketsHookQuery,
} from './__generated__/MarketsHooks';

export const useMarkets = () => {
  const yesterday = useYesterday();
  const { data, loading, error, subscribeToMore } = useMarketsHookQuery({
    variables: {
      since: new Date(yesterday).toISOString(),
      interval: Schema.Interval.INTERVAL_I1H,
    },
  });

  const ids = useMemo(() => {
    if (!data?.marketsConnection?.edges.length) return [];
    return data.marketsConnection.edges.map((e) => e.node.id);
  }, [data]);

  useEffect(() => {
    const unsub = subscribeToMore<
      MarketsDataHookSubscription,
      MarketsDataHookSubscriptionVariables
    >({
      document: MarketsDataHookDocument,
      variables: { marketIds: ids },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const updatedEdges = prev.marketsConnection?.edges.map((edge) => {
          const data = subscriptionData.data.marketsData.find(
            (d) => d.marketId === edge.node.id
          );

          if (!data) {
            return edge;
          }

          const incomingData: MarketHookDataFragment = {
            __typename: 'MarketData',
            market: {
              __typename: 'Market',
              id: edge.node.id,
            },
            bestBidPrice: data.bestBidPrice,
            bestOfferPrice: data.bestOfferPrice,
            markPrice: data.markPrice,
            trigger: data.trigger,
            staticMidPrice: data.staticMidPrice,
            marketTradingMode: data.marketTradingMode,
            marketState: data.marketState,
            indicativeVolume: data.indicativeVolume,
            indicativePrice: data.indicativePrice,
            bestStaticBidPrice: data.bestStaticBidPrice,
            bestStaticOfferPrice: data.bestStaticOfferPrice,
            targetStake: data.targetStake,
            suppliedStake: data.suppliedStake,
            auctionStart: data.auctionStart,
            auctionEnd: data.auctionEnd,
            timestamp: data.timestamp,
          };

          if (isEqual(incomingData, edge.node.data)) {
            return edge;
          }

          // TODO: dont update if data is equal to edge.node.data
          // eg: if (data & !isEqual(updateFields, currentFields)) {
          return {
            ...edge,
            node: {
              ...edge.node,
              data: incomingData,
            },
          };
        });

        return {
          ...prev,
          marketsConnection: {
            ...prev.marketsConnection,
            edges: updatedEdges,
          },
        } as MarketHookQuery;
      },
    });

    return () => {
      unsub();
    };
  }, [subscribeToMore, ids]);

  const markets = useMemo(() => {
    if (!data?.marketsConnection?.edges.length) return [];
    return data?.marketsConnection.edges.map((e) => e.node);
  }, [data]);

  return { data, loading, error, markets };
};
