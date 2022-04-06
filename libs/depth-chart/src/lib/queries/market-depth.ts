import { gql } from '@apollo/client';

export const marketDepthQuery = gql`
  query marketDepth($marketId: ID!) {
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

export const marketDepthUpdateSubscription = gql`
  subscription marketDepthUpdateSubscribe($marketId: ID!) {
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
