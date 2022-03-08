import { gql, useApolloClient } from '@apollo/client';

const ORDER_FRAMENT = gql`
  fragment OrderFields on Order {
    id
    price
    size
    updatedAt
    createdAt
    timeInForce
    side
    status
    party {
      id
    }
    reference
    remaining
    type
    market {
      id
      decimalPlaces
      tradableInstrument {
        instrument {
          id
          name
          code
        }
      }
    }
    liquidityProvision {
      id
    }
    peggedOrder {
      ... on PeggedOrder {
        offset
        reference
      }
    }
    expiresAt
    rejectionReason
    pending @client
    pendingAction @client
    deterministicId @client
  }
`;

const ORDERS_QUERY = gql`
  ${ORDER_FRAMENT}
  query order($partyId: ID!) {
    party(id: $partyId) {
      id
      orders(last: 500) {
        ...OrderFields
      }
    }
  }
`;

export const useOrderSubmit = () => {
  const client = useApolloClient();
  alert('TODO: Submit order');
};
