import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { updateLevels } from './orderbook-data';
import type {
  MarketDepth,
  MarketDepth_market,
} from './__generated__/MarketDepth';
import type {
  MarketDepthSubscription,
  MarketDepthSubscription_marketDepthUpdate,
} from './__generated__/MarketDepthSubscription';

const MARKET_DEPTH_QUERY = gql`
  query MarketDepth($marketId: ID!) {
    market(id: $marketId) {
      id
      decimalPlaces
      data {
        midPrice
        market {
          id
        }
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
          market {
            id
          }
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
