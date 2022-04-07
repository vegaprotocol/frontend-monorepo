import { gql } from '@apollo/client';

export const MARKET_DEPTH_QUERY = gql`
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

export const MARKET_DEPTH_UPDATE_SUB = gql`
  subscription MarketDepthUpdateSubscribe($marketId: ID!) {
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
