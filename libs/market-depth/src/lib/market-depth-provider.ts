import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { updateLevels } from './orderbook-data';
import type { Update } from '@vegaprotocol/react-helpers';
import type {
  MarketDepth,
  MarketDepth_market,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription,
  MarketDepthSubscription_marketsDepthUpdate,
} from './__generated__/MarketDepthSubscription';

const MARKET_DEPTH_QUERY = gql`
  query MarketDepth($marketId: ID!) {
    market(id: $marketId) {
      id
      depth {
        sell {
          price
          volume
          numberOfOrders
        }
        buy {
          price
          volume
          numberOfOrders
        }
        sequenceNumber
      }
    }
  }
`;

export const MARKET_DEPTH_SUBSCRIPTION_QUERY = gql`
  subscription MarketDepthSubscription($marketId: ID!) {
    marketsDepthUpdate(marketIds: [$marketId]) {
      marketId
      sell {
        price
        volume
        numberOfOrders
      }
      buy {
        price
        volume
        numberOfOrders
      }
      sequenceNumber
      previousSequenceNumber
    }
  }
`;

const sequenceNumbers: Record<string, number> = {};

const update: Update<
  MarketDepth_market,
  MarketDepthSubscription_marketsDepthUpdate[]
> = (data, deltas, reload) => {
  for (const delta of deltas) {
    if (delta.marketId !== data.id) {
      continue;
    }
    const sequenceNumber = Number(delta.sequenceNumber);
    if (sequenceNumber <= sequenceNumbers[delta.marketId]) {
      return data;
    }
    /*
      if (sequenceNumber - 1 !== sequenceNumbers[delta.market.id]) {
        sequenceNumbers[delta.market.id] = 0;
        reload();
        return;
      }
      */
    sequenceNumbers[delta.marketId] = sequenceNumber;
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

const getData = (responseData: MarketDepth) => {
  if (responseData.market?.id) {
    sequenceNumbers[responseData.market.id] = Number(
      responseData.market.depth.sequenceNumber
    );
  }
  return responseData.market;
};
const getDelta = (subscriptionData: MarketDepthSubscription) =>
  subscriptionData.marketsDepthUpdate;

export const marketDepthProvider = makeDataProvider({
  query: MARKET_DEPTH_QUERY,
  subscriptionQuery: MARKET_DEPTH_SUBSCRIPTION_QUERY,
  update,
  getData,
  getDelta,
});

export default marketDepthProvider;
