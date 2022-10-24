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

const sequenceNumbers: Record<string, number> = {};

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
    const currentSequenceNumber = Number(delta.sequenceNumber);
    if (currentSequenceNumber <= sequenceNumbers[delta.marketId]) {
      return data;
    }
    if (
      delta.previousSequenceNumber !==
      sequenceNumbers[delta.marketId].toString()
    ) {
      captureException(
        new Error(
          `Sequence number gap in marketsDepthUpdate for {data.id}, {sequenceNumbers[delta.marketId]} - {delta.previousSequenceNumber}`
        )
      );
      delete sequenceNumbers[delta.marketId];
      reload();
      return;
    }
    sequenceNumbers[delta.marketId] = Number(currentSequenceNumber);
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
    sequenceNumbers[responseData.market.id] = Number(
      responseData.market.depth.sequenceNumber
    );
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
