import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { updateLevels } from './orderbook-data';
import type { Update } from '@vegaprotocol/react-helpers';
import {
  MarketDepthDocument,
  MarketDepthEventDocument,
} from './__generated__/MarketDepth';
import type {
  MarketDepthQuery,
  MarketDepthEventSubscription,
} from './__generated__/MarketDepth';

const sequenceNumbers: Record<string, number> = {};

const update: Update<
  MarketDepthQuery['market'],
  MarketDepthEventSubscription['marketDepthUpdate']
> = (data, delta, reload) => {
  if (!data) {
    return null
  }

  if (delta.market.id !== data.id) {
    return data;
  }
  const sequenceNumber = Number(delta.sequenceNumber);
  if (sequenceNumber <= sequenceNumbers[delta.market.id]) {
    return data;
  }
  /*
  if (sequenceNumber - 1 !== sequenceNumbers[delta.market.id]) {
    sequenceNumbers[delta.market.id] = 0;
    reload();
    return;
  }
  */
  sequenceNumbers[delta.market.id] = sequenceNumber;
  const updatedData = {
    ...data,
    data: delta.market.data,
    depth: { ...data.depth },
  };
  if (delta.buy) {
    updatedData.depth.buy = updateLevels(data.depth.buy ?? [], delta.buy);
  }
  if (delta.sell) {
    updatedData.depth.sell = updateLevels(data.depth.sell ?? [], delta.sell);
  }
  return updatedData;
};

const getData = (responseData: MarketDepthQuery) => {
  if (responseData.market?.id) {
    sequenceNumbers[responseData.market.id] = Number(
      responseData.market.depth.sequenceNumber
    );
  }
  return responseData.market;
};
const getDelta = (subscriptionData: MarketDepthEventSubscription) =>
  subscriptionData.marketDepthUpdate;

export const marketDepthDataProvider = makeDataProvider({
  query: MarketDepthDocument,
  subscriptionQuery: MarketDepthEventDocument,
  update,
  getData,
  getDelta,
});

export default marketDepthDataProvider;
