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

const sequenceNumbers: Record<string, number> = {};

const update: Update<
  MarketDepth_market,
  MarketDepthSubscription_marketDepthUpdate
> = (draft, delta, restart) => {
  if (delta.market.id !== draft.id) {
    return;
  }
  const sequenceNumber = Number(delta.sequenceNumber);
  if (sequenceNumber <= sequenceNumbers[delta.market.id]) {
    return;
  }
  if (sequenceNumber - 1 !== sequenceNumbers[delta.market.id]) {
    sequenceNumbers[delta.market.id] = 0;
    restart(true);
    return;
  }
  sequenceNumbers[delta.market.id] = sequenceNumber;
  if (delta.buy) {
    draft.depth.buy = updateLevels(draft.depth.buy ?? [], delta.buy);
  }
  if (delta.sell) {
    draft.depth.sell = updateLevels(draft.depth.sell ?? [], delta.sell);
  }
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
  subscriptionData.marketDepthUpdate;

export const marketDepthDataProvider = makeDataProvider(
  MARKET_DEPTH_QUERY,
  MARKET_DEPTH_SUBSCRIPTION_QUERY,
  update,
  getData,
  getDelta
);
