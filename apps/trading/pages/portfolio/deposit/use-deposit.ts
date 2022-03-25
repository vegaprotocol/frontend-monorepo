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
import { useBridgeContract } from './use-bridge-contract';
import { useEthereumTransaction } from './use-ethereum-transaction';

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
      // @ts-ignore get around args typing
      return contract.depositAsset(...args);
    }, ethereumConfig.confirmations);
  const [finalizedDeposit, setFinalizedDeposit] =
    useState<DepositEvent_busEvents_event_Deposit>(null);

  useSubscription<DepositEvent, DepositEventVariables>(DEPOSIT_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data.busEvents.length) {
        return;
      }

      const matchingDeposit = subscriptionData.data.busEvents.find((e) => {
        if (e.event.__typename !== 'Deposit') {
          return false;
        }

        console.log(e);

        if (
          e.event.txHash === txHash &&
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
