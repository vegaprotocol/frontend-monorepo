import { useYesterday } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import isEqual from 'lodash/isEqual';
import { useEffect } from 'react';
import {
  MarketsDataHookDocument,
  useMarketHookQuery,
} from './__generated__/MarketsHooks';
import type {
  MarketHookDataFragment,
  MarketHookQuery,
  MarketsDataHookSubscription,
  MarketsDataHookSubscriptionVariables,
} from './__generated__/MarketsHooks';

export type MarketX = NonNullable<MarketHookQuery['market']>;

export const useMarket = (marketId?: string) => {
  const yesterday = useYesterday();
  const { data, loading, error, subscribeToMore } = useMarketHookQuery({
    variables: {
      marketId: marketId || '',
      since: new Date(yesterday).toISOString(),
      interval: Schema.Interval.INTERVAL_I1H,
    },
    skip: !marketId,
    pollInterval: 1 * 60 * 60 * 1000, // poll once an hour so sparkline is up to date
  });

  useEffect(() => {
    if (!marketId) return;
    const unsub = subscribeToMore<
      MarketsDataHookSubscription,
      MarketsDataHookSubscriptionVariables
    >({
      document: MarketsDataHookDocument,
      variables: { marketIds: [marketId] },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData || !prev.market) {
          return prev;
        }

        const data = subscriptionData.data.marketsData[0];

        const incomingData: MarketHookDataFragment = {
          __typename: 'MarketData',
          market: {
            __typename: 'Market',
            id: prev.market.id,
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
        };

        if (isEqual(incomingData, prev.market.data)) {
          return prev;
        }

        return {
          ...prev,
          market: {
            ...prev.market,
            data: incomingData,
          },
        };
      },
    });

    return () => {
      unsub();
    };
  }, [marketId, subscribeToMore]);

  return { data, loading, error };
};
