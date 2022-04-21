import { gql, useApolloClient } from '@apollo/client';
import { captureException } from '@sentry/nextjs';
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
    pendingOnForeignChain
    txHash
  }
`;

export interface WithdrawTransactionArgs {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
}

export const useCompleteWithdraw = () => {
  const { query, cache } = useApolloClient();
  const contract = useBridgeContract();
  const [id, setId] = useState('');
  const { transaction, perform } =
    useEthereumTransaction<WithdrawTransactionArgs>((args) => {
      if (!contract) {
        return null;
      }
      return contract.withdraw(args);
    });

  const submit = useCallback(
    async (withdrawalId: string) => {
      setId(withdrawalId);
      try {
        const res = await query<Erc20Approval, Erc20ApprovalVariables>({
          query: ERC20_APPROVAL_QUERY,
          variables: { withdrawalId },
        });

        if (!res.data.erc20WithdrawalApproval) {
          throw new Error('Could not retrieve withdrawal approval');
        }

        perform(res.data.erc20WithdrawalApproval);
      } catch (err) {
        captureException(err);
      }
    },
    [query, perform]
  );

  useEffect(() => {
    console.log(id, transaction.txHash);
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

  return { transaction, submit };
};
