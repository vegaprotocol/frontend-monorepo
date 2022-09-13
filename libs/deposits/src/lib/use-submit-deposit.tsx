import { useSubscription } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { DepositEventDocument } from './__generated__/Deposit';
import type {
  DepositEventSubscription,
  DepositEventSubscriptionVariables,
} from './__generated__/Deposit';
import { Schema } from '@vegaprotocol/types';
import { useState } from 'react';
import {
  remove0x,
  removeDecimal,
} from '@vegaprotocol/react-helpers';
import {
  useBridgeContract,
  useEthereumConfig,
  useEthereumTransaction,
  useTokenContract,
} from '@vegaprotocol/web3';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import { useDepositStore } from './deposit-store';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';

export const useSubmitDeposit = () => {
  const { asset, update } = useDepositStore();
  const { config } = useEthereumConfig();
  const bridgeContract = useBridgeContract();
  const tokenContract = useTokenContract(asset, true);

  // Store public key from contract arguments for use in the subscription,
  // NOTE: it may be different from the users connected key
  const [partyId, setPartyId] = useState<string | null>(null);

  const getBalance = useGetBalanceOfERC20Token(tokenContract, asset);

  const transaction = useEthereumTransaction<CollateralBridge, 'deposit_asset'>(
    bridgeContract,
    'deposit_asset',
    config?.confirmations,
    true
  );

  useSubscription<DepositEventSubscription, DepositEventSubscriptionVariables>(
    DepositEventDocument,
    {
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
            e.event.status === Schema.DepositStatus.STATUS_FINALIZED
          ) {
            return true;
          }

          return false;
        });

        if (matchingDeposit && matchingDeposit.event.__typename === 'Deposit') {
          transaction.setConfirmed();
        }
      },
    }
  );

  return {
    ...transaction,
    perform: async (args: {
      assetSource: string;
      amount: string;
      vegaPublicKey: string;
    }) => {
      if (!asset) return;
      try {
        setPartyId(args.vegaPublicKey);
        const publicKey = prepend0x(args.vegaPublicKey);
        const amount = removeDecimal(args.amount, asset.decimals);
        await transaction.perform(args.assetSource, amount, publicKey);
        const balance = await getBalance();
        update({ balance });
      } catch (err) {
        Sentry.captureException(err);
      }
    },
  };
};
