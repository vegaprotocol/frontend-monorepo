import { gql, useSubscription } from '@apollo/client';
import {
  DepositEvent,
  DepositEventVariables,
  DepositEvent_busEvents_event_Deposit,
  DepositStatus,
} from '@vegaprotocol/graphql';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useState } from 'react';
import { EthereumConfig } from '../../../components/web3-container/web3-container';
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

export const useDeposit = (ethereumConfig: EthereumConfig) => {
  const { keypair } = useVegaWallet();
  const contract = useBridgeContract();

  const { perform, status, error, confirmations, txHash } =
    useEthereumTransaction((...args) => {
      if (!contract) {
        return null;
      }
      // @ts-ignore get around args typing
      return contract.depositAsset(...args);
    }, ethereumConfig.confirmations);
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
          e.event.txHash === txHash &&
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
    perform,
    status,
    error,
    confirmations,
    txHash,
    finalizedDeposit,
  };
};
