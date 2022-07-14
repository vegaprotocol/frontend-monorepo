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
      positionDecimalPlaces
      data {
        staticMidPrice
        marketTradingMode
        indicativeVolume
        indicativePrice
        bestStaticBidPrice
        bestStaticOfferPrice
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
        positionDecimalPlaces
        data {
          staticMidPrice
          marketTradingMode
          indicativeVolume
          indicativePrice
          bestStaticBidPrice
          bestStaticOfferPrice
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
> = (data, delta, reload) => {
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
  const updatedData = { ...data };
  data.data = delta.market.data;
  if (delta.buy) {
    updatedData.depth.buy = updateLevels(data.depth.buy ?? [], delta.buy);
  }
  if (delta.sell) {
    updatedData.depth.sell = updateLevels(data.depth.sell ?? [], delta.sell);
  }
  return updatedData;
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

export default marketDepthDataProvider;
