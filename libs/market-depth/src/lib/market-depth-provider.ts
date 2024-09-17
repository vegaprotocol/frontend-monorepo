import { useDataProvider, type Update } from '@vegaprotocol/data-provider';
import { makeDataProvider } from '@vegaprotocol/data-provider';
import { updateLevels, combineVolume } from './orderbook-data';

import {
  MarketDepthDocument,
  MarketDepthUpdateDocument,
  type PriceLevelFieldsFragment,
  type MarketDepthQuery,
  type MarketDepthQueryVariables,
  type MarketDepthUpdateSubscription,
} from './__generated__/MarketDepth';

export type PriceLevel = Omit<
  PriceLevelFieldsFragment,
  'ammVolume' | 'ammVolumeEstimated'
>;

export const update: Update<
  ReturnType<typeof getData>,
  ReturnType<typeof getDelta>,
  MarketDepthQueryVariables
> = (data, deltas, reload) => {
  if (!data) {
    return data;
  }
  for (const delta of deltas) {
    if (delta.marketId !== data.id) {
      continue;
    }
    if (BigInt(delta.sequenceNumber) <= BigInt(data.depth.sequenceNumber)) {
      return data;
    }
    if (delta.previousSequenceNumber !== data.depth.sequenceNumber) {
      console.error(
        new Error(
          `Sequence number gap between delta previousSequenceNumber and stored sequence number in marketsDepthUpdate for market ${data.id}; ${delta.previousSequenceNumber} !== ${data.depth.sequenceNumber}, data provider reload`
        )
      );
      reload();
      return data;
    }
    const updatedData = {
      ...data,
      depth: {
        ...data.depth,
      },
    };
    if (delta.buy) {
      updatedData.depth.buy = updateLevels(
        data.depth.buy ?? [],
        delta.buy,
        false
      );
    }
    if (delta.sell) {
      updatedData.depth.sell = updateLevels(
        data.depth.sell ?? [],
        delta.sell,
        true
      );
    }
    updatedData.depth.sequenceNumber = delta.sequenceNumber;
    return updatedData;
  }
  return data;
};

const getData = (responseData: MarketDepthQuery | null) => {
  if (!responseData?.market) return null;
  return {
    ...responseData?.market,
    depth: {
      ...responseData?.market?.depth,
      buy: responseData?.market?.depth?.buy?.map((b) => {
        return combineVolume(b);
      }),
      sell: responseData?.market?.depth?.sell?.map((s) => {
        return combineVolume(s);
      }),
    },
  };
};

const getDelta = (subscriptionData: MarketDepthUpdateSubscription) =>
  subscriptionData.marketsDepthUpdate;

export const marketDepthProvider = makeDataProvider<
  MarketDepthQuery,
  ReturnType<typeof getData>,
  MarketDepthUpdateSubscription,
  ReturnType<typeof getDelta>,
  MarketDepthQueryVariables
>({
  query: MarketDepthDocument,
  subscriptionQuery: MarketDepthUpdateDocument,
  update,
  getData,
  getDelta,
});

export const useOrderbook = (marketId: string) => {
  return useDataProvider({
    dataProvider: marketDepthProvider,
    variables: { marketId },
  });
};
