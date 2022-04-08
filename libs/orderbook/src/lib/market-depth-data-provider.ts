import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDepth,
  MarketDepth_market,
  MarketDepth_market_depth_buy,
  MarketDepth_market_depth_sell,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription,
  MarketDepthSubscription_marketDepthUpdate,
  MarketDepthSubscription_marketDepthUpdate_buy,
  MarketDepthSubscription_marketDepthUpdate_sell,
} from './__generated__/MarketDepthSubscription';

const MARKET_DEPTH_QUERY = gql`
  query MarketDepth($marketId: ID!) {
    market(id: $marketId) {
      id
      decimalPlaces
      data {
        midPrice
      }
      depth {
        lastTrade {
          price
        }
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
    marketDepthUpdate(marketId: $marketId) {
      market {
        id
        data {
          midPrice
        }
      }
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
`;

const updateLevels = (
  levels:
    | (MarketDepth_market_depth_buy | MarketDepth_market_depth_sell)[]
    | null,
  updates: (
    | MarketDepthSubscription_marketDepthUpdate_buy
    | MarketDepthSubscription_marketDepthUpdate_sell
  )[]
) => {
  updates.forEach((update) => {
    if (levels) {
      let index = levels.findIndex((level) => level.price === update.price);
      if (index) {
        if (update.volume !== '0') {
          levels.splice(index, 1);
        } else {
          Object.assign(levels[index], update);
        }
      } else {
        index = levels.findIndex((level) => level.price > update.price);
        if (index !== -1) {
          levels.splice(index, 0, update);
        } else {
          levels.push(update);
        }
      }
    } else if (update.volume !== '0') {
      levels = [update];
    }
  });
  return levels;
};

const update = (
  draft: MarketDepth_market,
  delta: MarketDepthSubscription_marketDepthUpdate
) => {
  if (delta.buy) {
    draft.depth.buy = updateLevels(draft.depth.buy, delta.buy);
  }
  if (delta.sell) {
    draft.depth.sell = updateLevels(draft.depth.sell, delta.sell);
  }
};

const getData = (responseData: MarketDepth) => responseData.market;
const getDelta = (subscriptionData: MarketDepthSubscription) =>
  subscriptionData.marketDepthUpdate;

export const marketDepthDataProvider = makeDataProvider(
  MARKET_DEPTH_QUERY,
  MARKET_DEPTH_SUBSCRIPTION_QUERY,
  update,
  getData,
  getDelta
);
