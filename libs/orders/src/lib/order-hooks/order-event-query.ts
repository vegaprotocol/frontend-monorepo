import { gql } from '@apollo/client';

export const ORDER_EVENT_SUB = gql`
  subscription OrderEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
      type
      event {
        ... on Order {
          type
          id
          status
          rejectionReason
          createdAt
          size
          price
          timeInForce
          expiresAt
          side
          market {
            id
            name
            decimalPlaces
            positionDecimalPlaces
          }
        }
      }
    }
  }
`;
