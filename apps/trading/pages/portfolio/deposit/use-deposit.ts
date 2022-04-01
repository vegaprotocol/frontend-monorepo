import { gql, useSubscription } from '@apollo/client';
import type {
  DepositEvent,
  DepositEventVariables,
  DepositEvent_busEvents_event_Deposit,
} from './__generated__/DepositEvent';
import { DepositStatus } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useState } from 'react';
import { useEthereumTransaction } from '../../../hooks/use-ethereum-transaction';
import type { VegaErc20Bridge } from '@vegaprotocol/smart-contracts-sdk';

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

export const useDeposit = (
  contract: VegaErc20Bridge | null,
  confirmations: number
) => {
  const { keypair } = useVegaWallet();

  const [confirmationEvent, setConfirmationEvent] =
    useState<DepositEvent_busEvents_event_Deposit | null>(null);

  const transaction = useEthereumTransaction<{
    assetSource: string;
    amount: string;
    vegaPublicKey: string;
  }>((args) => {
    if (!contract) {
      return null;
    }
    setConfirmationEvent(null);
    return contract.depositAsset(
      args.assetSource,
      args.amount,
      args.vegaPublicKey
    );
  }, confirmations);

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
        setConfirmationEvent(matchingDeposit.event);
      }
    },
  });

  return {
    ...transaction,
    confirmationEvent,
  };
};
