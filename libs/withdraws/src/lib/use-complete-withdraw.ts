import { gql, useApolloClient } from '@apollo/client';
import { captureException } from '@sentry/react';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { useBridgeContract, useEthereumTransaction } from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import { ERC20_APPROVAL_QUERY } from './queries';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
} from './__generated__/Erc20Approval';
import type { PendingWithdrawal } from './__generated__/PendingWithdrawal';

export const PENDING_WITHDRAWAL_FRAGMMENT = gql`
  fragment PendingWithdrawal on Withdrawal {
    pendingOnForeignChain @client
    txHash
  }
`;

export const useCompleteWithdraw = () => {
  const { query, cache } = useApolloClient();
  const contract = useBridgeContract();
  const [id, setId] = useState('');
  const { transaction, perform, Dialog } = useEthereumTransaction<
    CollateralBridge,
    'withdraw_asset'
  >(contract, 'withdraw_asset');

  const submit = useCallback(
    async (withdrawalId: string) => {
      setId(withdrawalId);
      try {
        if (!contract) {
          return;
        }
        const res = await query<Erc20Approval, Erc20ApprovalVariables>({
          query: ERC20_APPROVAL_QUERY,
          variables: { withdrawalId },
        });

        const approval = res.data.erc20WithdrawalApproval;
        if (!approval) {
          throw new Error('Could not retrieve withdrawal approval');
        }

        perform(
          approval.assetSource,
          approval.amount,
          approval.targetAddress,
          approval.creation,
          approval.nonce,
          approval.signatures
        );
      } catch (err) {
        captureException(err);
      }
    },
    [contract, query, perform]
  );

  useEffect(() => {
    if (id && transaction.txHash) {
      cache.writeFragment<PendingWithdrawal>({
        id: `Withdrawal:${id}`,
        fragment: PENDING_WITHDRAWAL_FRAGMMENT,
        data: {
          __typename: 'Withdrawal',
          pendingOnForeignChain: true,
          txHash: transaction.txHash,
        },
      });
    }
  }, [cache, transaction.txHash, id]);

  return { transaction, Dialog, submit, withdrawalId: id };
};
