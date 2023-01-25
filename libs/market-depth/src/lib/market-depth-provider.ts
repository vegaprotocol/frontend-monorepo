import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { updateLevels } from './orderbook-data';
import type { Update } from '@vegaprotocol/react-helpers';
import { captureException } from '@sentry/react';

import {
  MarketDepthDocument,
  MarketDepthUpdateDocument,
} from './__generated__/MarketDepth';
import type {
  MarketDepthQuery,
  MarketDepthUpdateSubscription,
} from './__generated__/MarketDepth';

export const update: Update<
  ReturnType<typeof getData>,
  ReturnType<typeof getDelta>
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
      captureException(
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
      updatedData.depth.buy = updateLevels(data.depth.buy ?? [], delta.buy);
    }
    if (delta.sell) {
      updatedData.depth.sell = updateLevels(data.depth.sell ?? [], delta.sell);
    }
    updatedData.depth.sequenceNumber = delta.sequenceNumber;
    return updatedData;
  }
  return data;
};

const getData = (responseData: MarketDepthQuery) => responseData.market;

const getDelta = (subscriptionData: MarketDepthUpdateSubscription) =>
  subscriptionData.marketsDepthUpdate;

export const marketDepthProvider = makeDataProvider({
  query: MarketDepthDocument,
  subscriptionQuery: MarketDepthUpdateDocument,
  update,
  getData,
  getDelta,
});
