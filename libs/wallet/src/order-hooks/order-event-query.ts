import { gql } from '@apollo/client';

export const ORDER_EVENT_SUB = gql`
  subscription OrderEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
      eventId
      block
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
          market {
            name
            decimalPlaces
          }
        }
      }
    }
  }
`;
