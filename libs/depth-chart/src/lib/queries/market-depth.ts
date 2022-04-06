import { gql } from '@apollo/client';

export const marketDepthQuery = gql`
  query marketDepth($marketId: ID!, $maxDepth: Int) {
    market(id: $marketId) {
      id
      decimalPlaces
      tradableInstrument {
        instrument {
          id
          name
          code
        }
      }
      depth(maxDepth: $maxDepth) {
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

export const marketDepthSubscription = gql`
  subscription marketDepthSubscribe($marketId: ID!) {
    marketDepth(marketId: $marketId) {
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
`;

export const marketDepthUpdateSubscription = gql`
  subscription marketDepthUpdateSubscribe($marketId: ID!) {
    marketDepthUpdate(marketId: $marketId) {
      market {
        id
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

export const lastPriceQuery = gql`
  query lastPrice($marketId: ID!) {
    market(id: $marketId) {
      id
      depth {
        lastTrade {
          price
        }
      }
    }
  }
`;
