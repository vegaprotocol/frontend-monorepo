import { gql, useSubscription } from '@apollo/client';
import { useState } from 'react';
import { useVegaWallet } from '../vega-wallet';
import { VegaTxStatus } from './use-vega-transaction';

const ORDER_EVENT_SUB = gql`
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
          }
        }
      }
    }
  }
`;

interface OrderDialogProps {
  status: VegaTxStatus;
  txHash?: string;
  error: string;
  id: string;
}

export const OrderDialog = ({
  status,
  txHash,
  error,
  id,
}: OrderDialogProps) => {
  const { keypair } = useVegaWallet();
  const [foundOrder, setFoundOrder] = useState<any>(null);

  useSubscription(ORDER_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data.busEvents.length) {
        return;
      }

      const matchingOrder = subscriptionData.data.busEvents.find((e: any) => {
        if (e.event.__typename !== 'Order') {
          return false;
        }

        if (e.event.id === id) {
          return true;
        }

        return false;
      });

      setFoundOrder(matchingOrder.event);
    },
  });

  if (status === VegaTxStatus.AwaitingConfirmation) {
    return (
      <div>
        <h1 className="text-h4">Confirm the transaction in your Vega wallet</h1>
      </div>
    );
  }

  // Rejected by wallet
  if (status === VegaTxStatus.Rejected) {
    return (
      <div>
        <h1 className="text-h4">Order rejected by wallet</h1>
        {error && <p>{error}</p>}
      </div>
    );
  }

  // Pending consensus
  if (!foundOrder) {
    return (
      <div>
        <h1 className="text-h4">Awaiting network confirmation</h1>
        {txHash && <p className="break-all">Tx hash: {txHash}</p>}
      </div>
    );
  }

  // Order on network but was rejected
  if (foundOrder.status === 'Rejected') {
    return (
      <div>
        <h1 className="text-h4">Order failed</h1>
        <p>Reason: {foundOrder.rejectionReason}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h4">Order placed</h1>
      <p>Status: {foundOrder.status}</p>
      <p>Market: {foundOrder.market.name}</p>
      <p>Amount: {foundOrder.size}</p>
      {foundOrder.type === 'Limit' && <p>Price: {foundOrder.price}</p>}
    </div>
  );
};
