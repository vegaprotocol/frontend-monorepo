import { gql, useApolloClient } from '@apollo/client';
import { captureException } from '@sentry/react';
import type {
  CollateralBridge,
  CollateralBridgeNew,
} from '@vegaprotocol/smart-contracts';
import { useBridgeContract, useEthereumTransaction } from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import { ERC20_APPROVAL_QUERY, ERC20_APPROVAL_QUERY_NEW } from './queries';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
} from './__generated__/Erc20Approval';
import type { Erc20ApprovalNew } from './__generated__/Erc20ApprovalNew';
import type { PendingWithdrawal } from './__generated__/PendingWithdrawal';

export const PENDING_WITHDRAWAL_FRAGMMENT = gql`
  fragment PendingWithdrawal on Withdrawal {
    pendingOnForeignChain @client
    txHash
  }
`;

export interface NewWithdrawTransactionArgs {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
  creation: string;
}

export interface WithdrawTransactionArgs {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
}

export const useCompleteWithdraw = (isNewContract: boolean) => {
  const { query, cache } = useApolloClient();
  const contract = useBridgeContract(isNewContract);
  const [id, setId] = useState('');
  const { transaction, perform } = useEthereumTransaction<
    WithdrawTransactionArgs | NewWithdrawTransactionArgs
  >((args) => {
    if (!contract) {
      return null;
    }
    if (contract.isNewContract) {
      const withdrawalData = args as NewWithdrawTransactionArgs;
      return (contract as CollateralBridgeNew).withdrawAsset(
        withdrawalData.assetSource,
        withdrawalData.amount,
        withdrawalData.targetAddress,
        withdrawalData.creation,
        withdrawalData.nonce,
        withdrawalData.signatures
      );
    } else {
      return (contract as CollateralBridge).withdrawAsset(
        args.assetSource,
        args.amount,
        args.targetAddress,
        args.nonce,
        args.signatures
      );
    }
  });

  const submit = useCallback(
    async (withdrawalId: string) => {
      setId(withdrawalId);
      try {
        const res = await query<
          Erc20Approval | Erc20ApprovalNew,
          Erc20ApprovalVariables
        >({
          query: isNewContract
            ? ERC20_APPROVAL_QUERY_NEW
            : ERC20_APPROVAL_QUERY,
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
    [query, isNewContract, perform]
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

  return { transaction, submit, withdrawalId: id };
};
