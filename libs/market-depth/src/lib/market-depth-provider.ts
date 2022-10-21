import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { updateLevels } from './orderbook-data';
import type { Update } from '@vegaprotocol/react-helpers';
import { captureException } from '@sentry/react';
import {
  MarketDepthDocument,
  MarketDepthUpdateDocument,
} from './__generated___/MarketDepth';
import type {
  MarketDepthQuery,
  MarketDepthUpdateSubscription,
} from './__generated___/MarketDepth';

const sequenceNumbers: Record<string, string> = {};

const update: Update<
  ReturnType<typeof getData>,
  ReturnType<typeof getDelta>
> = (data, deltas, reload) => {
  if (!data) {
    return;
  }
  for (const delta of deltas) {
    if (delta.marketId !== data.id) {
      continue;
    }
    if (delta.previousSequenceNumber !== sequenceNumbers[delta.marketId]) {
      captureException(
        new Error(
          `Sequence number gap in marketsDepthUpdate for {data.id}, {sequenceNumbers[delta.marketId]} - {delta.previousSequenceNumber}`
        )
      );
      delete sequenceNumbers[delta.marketId];
      reload();
      return;
    }
    sequenceNumbers[delta.marketId] = delta.sequenceNumber;
    const updatedData = {
      ...data,
      depth: { ...data.depth },
    };
    if (delta.buy) {
      updatedData.depth.buy = updateLevels(data.depth.buy ?? [], delta.buy);
    }
    if (delta.sell) {
      updatedData.depth.sell = updateLevels(data.depth.sell ?? [], delta.sell);
    }
    return updatedData;
  }
  return data;
};

const getData = (responseData: MarketDepthQuery) => {
  if (responseData.market?.id) {
    sequenceNumbers[responseData.market.id] =
      responseData.market.depth.sequenceNumber;
  }
  return responseData.market;
};
const getDelta = (subscriptionData: MarketDepthUpdateSubscription) =>
  subscriptionData.marketsDepthUpdate;

export const marketDepthProvider = makeDataProvider({
  query: MarketDepthDocument,
  subscriptionQuery: MarketDepthUpdateDocument,
  update,
  getData,
  getDelta,
});

export default marketDepthProvider;
