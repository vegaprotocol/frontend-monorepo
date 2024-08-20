import { useApolloClient } from '@apollo/client';
import BigNumber from 'bignumber.js';
import { useEffect, useRef } from 'react';
import { addDecimal } from '@vegaprotocol/utils';
import { useGetWithdrawThreshold } from './use-get-withdraw-threshold';
import { useGetWithdrawDelay } from './use-get-withdraw-delay';
import { localLoggerFactory } from '@vegaprotocol/logger';

import { useWeb3React } from '@web3-react/core';
import {
  WithdrawalApprovalDocument,
  type WithdrawalApprovalQuery,
  type WithdrawalApprovalQueryVariables,
} from './__generated__/WithdrawalApproval';
import { useEthTransactionStore } from './use-ethereum-transaction-store';
import {
  ApprovalStatus,
  useEthWithdrawApprovalsStore,
  WithdrawalFailure,
} from './use-ethereum-withdraw-approvals-store';
import { useT } from './use-t';
import { toAssetData } from './types';
import { useCollateralBridge } from './use-bridge-contract';

export const useEthWithdrawApprovalsManager = () => {
  const t = useT();
  const { chainId } = useWeb3React();
  const { contract, chainId: contractChainId } = useCollateralBridge(chainId);

  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();

  const { query } = useApolloClient();

  const createEthTransaction = useEthTransactionStore((state) => state.create);
  const update = useEthWithdrawApprovalsStore((state) => state.update);
  const processed = useRef<Set<number>>(new Set());
  const transaction = useEthWithdrawApprovalsStore((state) =>
    state.transactions.find(
      (transaction) =>
        transaction?.status === ApprovalStatus.Idle &&
        !processed.current.has(transaction.id)
    )
  );
  useEffect(() => {
    if (!transaction) {
      return;
    }

    processed.current.add(transaction.id);

    const { withdrawal } = transaction;
    let { approval } = transaction;
    if (withdrawal.asset.source.__typename !== 'ERC20') {
      update(transaction.id, {
        status: ApprovalStatus.Error,
        message: t(`Invalid asset source: {{source}}`, {
          source: withdrawal.asset.source.__typename,
        }),
        failureReason: WithdrawalFailure.InvalidAsset,
      });
      return;
    }

    if (!chainId) {
      update(transaction.id, {
        status: ApprovalStatus.Pending,
        message: t(`Connect wallet to withdraw`),
        failureReason: WithdrawalFailure.NoConnection,
      });
      return;
    }

    if (
      (chainId && chainId?.toString() !== withdrawal.asset.source.chainId) ||
      contractChainId?.toString() !== withdrawal.asset.source.chainId
    ) {
      update(transaction.id, {
        status: ApprovalStatus.Pending,
        message: t(`Change network`),
        failureReason: WithdrawalFailure.WrongConnection,
      });
      return;
    }

    update(transaction.id, {
      status: ApprovalStatus.Pending,
      message: t('Verifying withdrawal approval'),
    });

    const amount = new BigNumber(
      addDecimal(withdrawal.amount, withdrawal.asset.decimals)
    );

    (async () => {
      const assetData = toAssetData(withdrawal.asset);
      if (!assetData || !contract) return;

      const threshold = await getThreshold(assetData);

      if (threshold && amount.isGreaterThan(threshold)) {
        const delaySecs = await getDelay(assetData.chainId);

        const completeTimestamp =
          new Date(withdrawal.createdTimestamp).getTime() +
          (delaySecs as number) * 1000;
        const now = Date.now();
        if (now < completeTimestamp) {
          update(transaction.id, {
            status: ApprovalStatus.Delayed,
            threshold,
            completeTimestamp,
          });
          return;
        }
      }
      if (!approval) {
        const res = await query<
          WithdrawalApprovalQuery,
          WithdrawalApprovalQueryVariables
        >({
          query: WithdrawalApprovalDocument,
          variables: { withdrawalId: withdrawal.id },
        });
        approval = res.data.erc20WithdrawalApproval;
      }
      if (!approval || approval.signatures.length < 3) {
        update(transaction.id, {
          status: ApprovalStatus.Error,
          approval,
          message: t(`Withdraw dependencies not met.`),
        });
        return;
      }
      update(transaction.id, {
        status: ApprovalStatus.Ready,
        approval,
        dialogOpen: true,
      });

      createEthTransaction(
        contract,
        'withdrawAsset',
        [
          approval.assetSource,
          approval.amount,
          approval.targetAddress,
          approval.creation,
          approval.nonce,
          approval.signatures,
        ],
        undefined,
        undefined,
        undefined,
        transaction.withdrawal || undefined
      );
    })().catch((err) => {
      localLoggerFactory({ application: 'web3' }).error(
        'create withdrawal transaction',
        err
      );
      update(transaction.id, {
        status: ApprovalStatus.Error,
        message: t('Something went wrong'),
      });
    });
  }, [
    getThreshold,
    getDelay,
    createEthTransaction,
    query,
    transaction,
    update,
    chainId,
    t,
    contract,
    contractChainId,
  ]);
};
