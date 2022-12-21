import { useApolloClient } from '@apollo/client';
import BigNumber from 'bignumber.js';
import { useRef, useEffect } from 'react';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { useGetWithdrawThreshold } from './use-get-withdraw-threshold';
import { useGetWithdrawDelay } from './use-get-withdraw-delay';
import { t } from '@vegaprotocol/react-helpers';

import { CollateralBridge } from '@vegaprotocol/smart-contracts';

import { useEthereumConfig } from './use-ethereum-config';
import { useWeb3React } from '@web3-react/core';

import type {
  WithdrawalApprovalQuery,
  WithdrawalApprovalQueryVariables,
} from '@vegaprotocol/wallet';

import { WithdrawalApprovalDocument } from '@vegaprotocol/wallet';

import { useEthTransactionStore } from './use-ethereum-transaction-store';
import {
  useEthWithdrawApprovalsStore,
  ApprovalStatus,
} from './use-ethereum-withdraw-approvals-store';

export const useEthWithdrawApprovalsManager = () => {
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();
  const { query } = useApolloClient();
  const { provider } = useWeb3React();
  const { config } = useEthereumConfig();
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
        message: t(
          `Invalid asset source: ${withdrawal.asset.source.__typename}`
        ),
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
      const threshold = await getThreshold(withdrawal.asset);
      if (threshold && amount.isGreaterThan(threshold)) {
        const delaySecs = await getDelay();
        const completeTimestamp =
          new Date(withdrawal.createdTimestamp).getTime() + delaySecs * 1000;
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
      if (!(provider && config && approval) || approval.signatures.length < 3) {
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
        dialogOpen: false,
      });
      const signer = provider.getSigner();
      createEthTransaction(
        new CollateralBridge(
          config.collateral_bridge_contract.address,
          signer || provider
        ),
        'withdraw_asset',
        [
          approval.assetSource,
          approval.amount,
          approval.targetAddress,
          approval.creation,
          approval.nonce,
          approval.signatures,
        ]
      );
    })();
  }, [
    getThreshold,
    getDelay,
    config,
    createEthTransaction,
    provider,
    query,
    transaction,
    update,
  ]);
};
