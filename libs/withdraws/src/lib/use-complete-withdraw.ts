import { useApolloClient } from '@apollo/client';
import { type CollateralBridge } from '@vegaprotocol/smart-contracts';
import {
  EthTxStatus,
  useBridgeContract,
  useEthereumTransaction,
} from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';
import {
  Erc20ApprovalDocument,
  type Erc20ApprovalQuery,
  type Erc20ApprovalQueryVariables,
} from './__generated__/Erc20Approval';
import {
  PendingWithdrawalFragmentDoc,
  PendingWithdrawalFragment,
} from './__generated__/Withdrawal';

export const useCompleteWithdraw = () => {
  const { query, cache } = useApolloClient();
  const contract = useBridgeContract();
  const [id, setId] = useState('');
  const { transaction, perform, reset, Dialog } = useEthereumTransaction<
    CollateralBridge,
    'withdraw_asset'
  >(contract, 'withdraw_asset');

  const submit = useCallback(
    async (withdrawalId: string) => {
      setId(withdrawalId);

      const logger = localLoggerFactory({ application: 'deposits' });
      try {
        if (!contract) {
          return;
        }
        logger.info('get withdraw approval', { withdrawalId });
        const res = await query<
          Erc20ApprovalQuery,
          Erc20ApprovalQueryVariables
        >({
          query: Erc20ApprovalDocument,
          variables: { withdrawalId },
        });

        const approval = res.data.erc20WithdrawalApproval;

        if (!approval) {
          throw new Error('Could not retrieve withdrawal approval');
        }
        logger.info('withdraw transaction', { approval });
        perform(
          approval.assetSource,
          approval.amount,
          approval.targetAddress,
          approval.creation,
          approval.nonce,
          approval.signatures
        );
      } catch (err) {
        logger.error('withdraw transaction', err);
      }
    },
    [contract, query, perform]
  );

  useEffect(() => {
    if (id && transaction.txHash) {
      cache.writeFragment<PendingWithdrawalFragment>({
        id: `Withdrawal:${id}`,
        fragment: PendingWithdrawalFragmentDoc,
        data: {
          __typename: 'Withdrawal',
          pendingOnForeignChain:
            transaction.status === EthTxStatus.Pending ? true : false,
          txHash: transaction.txHash,
        },
      });
    }
  }, [cache, transaction.status, transaction.txHash, id]);

  return { transaction, reset, Dialog, submit, withdrawalId: id };
};
