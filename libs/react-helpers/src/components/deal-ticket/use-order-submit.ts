import { gql, useApolloClient } from '@apollo/client';
import { useCallback, useState } from 'react';
import { Order } from '../../hooks/use-order-state';

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

const commandSync = (arg: any): Promise<any> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        txHash: Math.random().toString(),
        tx: { signature: { value: 'FOO' } },
      });
    }, 1500);
  });
const sigToId = (sig: string) => 'foo';

export const useOrderSubmit = (marketId: string) => {
  const client = useApolloClient();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const submit = useCallback(
    async (order: Order) => {
      try {
        setLoading(true);
        setError('');
        setTxHash('');
        const res = await commandSync({
          pubKey: 'TODO_pubkey',
          orderSubmission: {
            reference: 'TODO_reference',
            marketId,
            price: order.price,
            size: order.size,
            type: order.type,
            side: order.side,
            timeInForce: order.timeInForce,
            // wallet expects nanoseconds but client uses just ms
            // expiresAt: variables.expiration
            //   ? msToNano(variables.expiration)
            //   : undefined,
            expiresAt: undefined, // TODO: convert to nanoseconds
          },
        });

        setTxHash(res.txHash);
        const determinedId = sigToId(res.tx.signature.value).toUpperCase();

        // TODO: Write order to cache with determinedId
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [marketId]
  );

  return {
    submit,
    error,
    loading,
    txHash,
  };
};
