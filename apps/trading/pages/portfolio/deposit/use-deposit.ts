import { gql, useSubscription } from '@apollo/client';
import {
  DepositEvent,
  DepositEventVariables,
  DepositEvent_busEvents_event_Deposit,
  DepositStatus,
} from '@vegaprotocol/graphql';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useState } from 'react';
import { useBridgeContract } from '../../../hooks/use-bridge-contract';
import { useEthereumTransaction } from '../../../hooks/use-ethereum-transaction';

const DEPOSIT_EVENT_SUB = gql`
  subscription DepositEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
      eventId
      block
      type
      event {
        ... on Deposit {
          id
          txHash
          status
        }
      }
    }
  }
`;

export const useDeposit = (confirmations: number) => {
  const contract = useBridgeContract();
  const { keypair } = useVegaWallet();

  const transaction = useEthereumTransaction<{
    assetSource: string;
    amount: string;
    vegaPublicKey: string;
  }>((args) => {
    if (!contract) {
      return null;
    }
    return contract.depositAsset(
      args.assetSource,
      args.amount,
      args.vegaPublicKey
    );
  }, confirmations);

  const [finalizedDeposit, setFinalizedDeposit] =
    useState<DepositEvent_busEvents_event_Deposit | null>(null);

  useSubscription<DepositEvent, DepositEventVariables>(DEPOSIT_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data?.busEvents?.length) {
        return;
      }

      const matchingDeposit = subscriptionData.data.busEvents.find((e) => {
        if (e.event.__typename !== 'Deposit') {
          return false;
        }

        if (
          e.event.txHash === transaction.txHash &&
          // Note there is a bug in data node where the subscription is not emitted when the status
          // changes from 'Open' to 'Finalized' as a result the deposit UI will hang in a pending state right now
          // https://github.com/vegaprotocol/data-node/issues/460
          e.event.status === DepositStatus.Finalized
        ) {
          return true;
        }

        return false;
      });

      if (matchingDeposit && matchingDeposit.event.__typename === 'Deposit') {
        setFinalizedDeposit(matchingDeposit.event);
      }
    },
  });

  return {
    ...transaction,
    finalizedDeposit,
  };
};
