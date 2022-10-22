import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { updateLevels } from './orderbook-data';
import type { Update } from '@vegaprotocol/react-helpers';
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
    /*
    const sequenceNumber = Number(delta.sequenceNumber);
    if (sequenceNumber <= sequenceNumbers[delta.marketId]) {
      return data;
    }
    if (sequenceNumber - 1 !== sequenceNumbers[delta.marketId]) {
      sequenceNumbers[delta.marketId] = 0;
      reload();
      return;
    }
    sequenceNumbers[delta.marketId] = sequenceNumber;
    */
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
