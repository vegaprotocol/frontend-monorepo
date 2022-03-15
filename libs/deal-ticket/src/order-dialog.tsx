import { gql, useSubscription } from '@apollo/client';
import { Icon, Loader } from '@vegaprotocol/ui-toolkit';
import { ReactNode, useEffect, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
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
  setStatus: (status: VegaTxStatus) => void;
  txHash?: string;
  error: object | null;
  id: string;
}

export const OrderDialog = ({
  status,
  setStatus,
  txHash,
  error,
  id,
}: OrderDialogProps) => {
  const { keypair } = useVegaWallet();
  // TODO: Figure out generating types for lib packages that need to make queries
  // eslint-disable-next-line
  const [foundOrder, setFoundOrder] = useState<any>(null);

  // Start a subscription looking for the newly created order
  useSubscription(ORDER_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data.busEvents.length) {
        return;
      }

      // No types available for the subscription result
      // eslint-disable-next-line
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

  useEffect(() => {
    if (foundOrder) {
      setStatus(VegaTxStatus.Default);
    }
  }, [foundOrder, setStatus]);

  // TODO: When wallets support confirming transactions return UI for 'awaiting confirmation' step

  // Rejected by wallet
  if (status === VegaTxStatus.Rejected) {
    return (
      <OrderDialogWrapper
        title="Order rejected by wallet"
        icon={<Icon name="warning-sign" size={20} />}
      >
        {error && (
          <pre className="text-ui break-all whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </OrderDialogWrapper>
    );
  }

  // Pending consensus
  if (!foundOrder) {
    return (
      <OrderDialogWrapper
        title="Awaiting network confirmation"
        icon={<Loader />}
      >
        {txHash && <p className="break-all">Tx hash: {txHash}</p>}
      </OrderDialogWrapper>
    );
  }

  // Order on network but was rejected
  if (foundOrder.status === 'Rejected') {
    return (
      <OrderDialogWrapper
        title="Order failed"
        icon={<Icon name="warning-sign" size={20} />}
      >
        <p>Reason: {foundOrder.rejectionReason}</p>
      </OrderDialogWrapper>
    );
  }

  return (
    <OrderDialogWrapper
      title="Order placed"
      icon={<Icon name="tick" size={20} />}
    >
      <p>Status: {foundOrder.status}</p>
      <p>Market: {foundOrder.market.name}</p>
      <p>Amount: {foundOrder.size}</p>
      {foundOrder.type === 'Limit' && <p>Price: {foundOrder.price}</p>}
    </OrderDialogWrapper>
  );
};

interface OrderDialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

const OrderDialogWrapper = ({
  children,
  icon,
  title,
}: OrderDialogWrapperProps) => {
  return (
    <div className="flex gap-12 max-w-full">
      <div className="pt-8 fill-current">{icon}</div>
      <div className="flex-1">
        <h1 className="text-h4">{title}</h1>
        {children}
      </div>
    </div>
  );
};
