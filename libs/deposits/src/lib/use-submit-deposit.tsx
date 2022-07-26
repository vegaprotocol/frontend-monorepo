import { gql, useSubscription } from '@apollo/client';
import type {
  DepositEvent,
  DepositEventVariables,
} from './__generated__/DepositEvent';
import { DepositStatus } from '@vegaprotocol/types';
import { useState } from 'react';
import { remove0x } from '@vegaprotocol/react-helpers';
import {
  useBridgeContract,
  useEthereumConfig,
  useEthereumTransaction,
} from '@vegaprotocol/web3';
import type {
  CollateralBridge,
  CollateralBridgeNew,
} from '@vegaprotocol/smart-contracts';
import { prepend0x } from '@vegaprotocol/smart-contracts';

const DEPOSIT_EVENT_SUB = gql`
  subscription DepositEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
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

export const useSubmitDeposit = () => {
  const { config } = useEthereumConfig();
  const contract = useBridgeContract(true);

  // Store public key from contract arguments for use in the subscription,
  // NOTE: it may be different from the users connected key
  const [partyId, setPartyId] = useState<string | null>(null);

  const transaction = useEthereumTransaction<
    CollateralBridgeNew | CollateralBridge,
    'deposit_asset'
  >(contract, 'deposit_asset', config?.confirmations, true);

  useSubscription<DepositEvent, DepositEventVariables>(DEPOSIT_EVENT_SUB, {
    variables: { partyId: partyId ? remove0x(partyId) : '' },
    skip: !partyId,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data?.busEvents?.length) {
        return;
      }

      const matchingDeposit = subscriptionData.data.busEvents.find((e) => {
        if (e.event.__typename !== 'Deposit') {
          return false;
        }

        if (
          e.event.txHash === transaction.transaction.txHash &&
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
        transaction.setConfirmed();
      }
    },
  });

  return {
    ...transaction,
    perform: (...args: Parameters<typeof transaction.perform>) => {
      setPartyId(args[2]);
      const publicKey = prepend0x(args[2]);
      transaction.perform(args[0], args[1], publicKey);
    },
  };
};
