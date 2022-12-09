import create from 'zustand';
import produce from 'immer';
import { useApolloClient } from '@apollo/client';
import type { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { useRef } from 'react';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { useGetWithdrawThreshold } from './use-get-withdraw-threshold';
import { useGetWithdrawDelay } from './use-get-withdraw-delay';

import type { EthereumError } from './ethereum-error';
import { isExpectedEthereumError } from './ethereum-error';
import { isEthereumError } from './ethereum-error';

import { t } from '@vegaprotocol/react-helpers';
import type { MultisigControl } from '@vegaprotocol/smart-contracts';
import { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type { Token } from '@vegaprotocol/smart-contracts';
import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';
import type { WithdrawalBusEventFieldsFragment } from '@vegaprotocol/wallet';
import { useEthereumConfig } from './use-ethereum-config';
import { useWeb3React } from '@web3-react/core';
import {
  useDepositBusEventSubscription,
  useVegaWallet,
  useVegaTransactionStore,
} from '@vegaprotocol/wallet';

import type {
  DepositBusEventFieldsFragment,
  WithdrawalApprovalQuery,
  WithdrawalApprovalQueryVariables,
} from '@vegaprotocol/wallet';
import { Schema } from '@vegaprotocol/types';
import { WithdrawalApprovalDocument } from '@vegaprotocol/wallet';
import type { EthTxState } from './use-ethereum-transaction';
import { EthTxStatus } from './use-ethereum-transaction';

type Contract = MultisigControl | CollateralBridge | Token | TokenFaucetable;
type ContractMethod =
  | keyof MultisigControl
  | keyof CollateralBridge
  | keyof Token
  | keyof TokenFaucetable;

export interface EthStoredTxState extends EthTxState {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  contract: Contract;
  methodName: ContractMethod;
  args: string[];
  requiredConfirmations: number;
  requiresConfirmation: boolean;
  assetId?: string;
  deposit?: DepositBusEventFieldsFragment;
}

interface EthTransactionStore {
  transactions: (EthStoredTxState | undefined)[];
  create: (
    contract: Contract,
    methodName: ContractMethod,
    args: string[],
    assetId?: string,
    requiredConfirmations?: number,
    requiresConfirmation?: boolean
  ) => number;
  update: (
    id: EthStoredTxState['id'],
    update?: Partial<
      Pick<
        EthStoredTxState,
        'status' | 'error' | 'receipt' | 'confirmations' | 'txHash'
      >
    >
  ) => void;
  dismiss: (index: number) => void;
  updateDeposit: (deposit: DepositBusEventFieldsFragment) => void;
  delete: (index: number) => void;
}

export const useEthTransactionStore = create<EthTransactionStore>(
  (set, get) => ({
    transactions: [] as EthStoredTxState[],
    create: (
      contract: Contract,
      methodName: ContractMethod,
      args: string[] = [],
      assetId = '',
      requiredConfirmations = 1,
      requiresConfirmation = false
    ) => {
      const transactions = get().transactions;
      const now = new Date();
      const transaction: EthStoredTxState = {
        id: transactions.length,
        createdAt: now,
        updatedAt: now,
        contract,
        methodName,
        args,
        status: EthTxStatus.Default,
        error: null,
        txHash: null,
        receipt: null,
        confirmations: 0,
        dialogOpen: true,
        requiredConfirmations,
        requiresConfirmation,
        assetId,
      };
      set({ transactions: transactions.concat(transaction) });
      return transaction.id;
    },
    update: (
      id: EthStoredTxState['id'],
      update?: Partial<EthStoredTxState>
    ) => {
      set({
        transactions: produce(get().transactions, (draft) => {
          const transaction = draft.find(
            (transaction) => transaction?.id === id
          );
          if (transaction) {
            Object.assign(transaction, update);
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        }),
      });
    },
    dismiss: (index: number) => {
      set(
        produce((state: EthTransactionStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            transaction.dialogOpen = false;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
    updateDeposit: (deposit: DepositBusEventFieldsFragment) => {
      set(
        produce((state: EthTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction &&
              transaction.status === EthTxStatus.Pending &&
              deposit.txHash === transaction.txHash
          );
          if (!transaction) {
            return;
          }
          transaction.status = EthTxStatus.Confirmed;
          transaction.deposit = deposit;
          transaction.dialogOpen = true;
          transaction.updatedAt = new Date();
        })
      );
    },
    delete: (index: number) => {
      set(
        produce((state: EthTransactionStore) => {
          delete state.transactions[index];
        })
      );
    },
  })
);

export const useEthTransactionManager = () => {
  const update = useEthTransactionStore((state) => state.update);
  const processed = useRef<Set<number>>(new Set());
  const transaction = useEthTransactionStore((state) =>
    state.transactions.find(
      (transaction) =>
        transaction?.status === EthTxStatus.Default &&
        !processed.current.has(transaction.id)
    )
  );
  if (!transaction) {
    return;
  }
  processed.current.add(transaction.id);
  (async () => {
    update(transaction.id, {
      status: EthTxStatus.Requested,
      error: null,
      confirmations: 0,
    });
    const {
      contract,
      methodName,
      args,
      requiredConfirmations,
      requiresConfirmation,
    } = transaction;
    try {
      if (
        !contract ||
        // @ts-ignore method vary depends on contract
        typeof contract[methodName] !== 'function' ||
        typeof contract.contract.callStatic[methodName] !== 'function'
      ) {
        throw new Error('method not found on contract');
      }
      await contract.contract.callStatic[methodName](...args);
    } catch (err) {
      update(transaction.id, {
        status: EthTxStatus.Error,
        error: err as EthereumError,
      });
      return;
    }

    try {
      // @ts-ignore method vary depends on contract
      const method = contract[methodName];

      if (!method || typeof method !== 'function') {
        throw new Error('method not found on contract');
      }

      // @ts-ignore args will vary depends on contract and method
      const tx = await method.call(contract, ...args);

      let receipt: ethers.ContractReceipt | null = null;

      update(transaction.id, {
        status: EthTxStatus.Pending,
        txHash: tx.hash,
      });

      for (let i = 1; i <= requiredConfirmations; i++) {
        receipt = await tx.wait(i);
        update(transaction.id, {
          confirmations: receipt
            ? receipt.confirmations
            : requiredConfirmations,
        });
      }

      if (!receipt) {
        throw new Error('no receipt after confirmations are met');
      }

      if (requiresConfirmation) {
        update(transaction.id, { status: EthTxStatus.Complete, receipt });
      } else {
        update(transaction.id, { status: EthTxStatus.Confirmed, receipt });
      }
    } catch (err) {
      if (err instanceof Error || isEthereumError(err)) {
        if (!isExpectedEthereumError(err)) {
          update(transaction.id, { status: EthTxStatus.Error, error: err });
        }
      } else {
        update(transaction.id, {
          status: EthTxStatus.Error,
          error: new Error('Something went wrong'),
        });
      }
      return;
    }
  })();
};

export const useEthTransactionUpdater = () => {
  const { pubKey } = useVegaWallet();
  const updateDeposit = useEthTransactionStore((state) => state.updateDeposit);
  const variables = { partyId: pubKey || '' };
  const skip = !!pubKey;
  useDepositBusEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (
          event.event.__typename === 'Deposit' &&
          // Note there is a bug in data node where the subscription is not emitted when the status
          // changes from 'Open' to 'Finalized' as a result the deposit UI will hang in a pending state right now
          // https://github.com/vegaprotocol/data-node/issues/460
          event.event.status === Schema.DepositStatus.STATUS_FINALIZED
        ) {
          updateDeposit(event.event);
        }
      }),
  });
};

export enum ApprovalStatus {
  Idle = 'Idle',
  Pending = 'Pending',
  Delayed = 'Delayed',
  Error = 'Error',
  Ready = 'Ready',
}
export interface EthWithdrawalApprovalState {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  status: ApprovalStatus;
  message?: string; //#TODO message is not use anywhere
  threshold?: BigNumber;
  completeTimestamp?: number | null;
  dialogOpen?: boolean;
  withdrawal: WithdrawalBusEventFieldsFragment;
  approval?: WithdrawalApprovalQuery['erc20WithdrawalApproval'];
}
interface EthWithdrawApprovalStore {
  transactions: (EthWithdrawalApprovalState | undefined)[];
  create: (
    withdrawal: EthWithdrawalApprovalState['withdrawal'],
    approval?: EthWithdrawalApprovalState['approval']
  ) => number;
  update: (
    id: EthWithdrawalApprovalState['id'],
    update?: Partial<
      Pick<
        EthWithdrawalApprovalState,
        | 'approval'
        | 'status'
        | 'message'
        | 'threshold'
        | 'completeTimestamp'
        | 'dialogOpen'
      >
    >
  ) => void;
  dismiss: (index: number) => void;
}

export const useEthWithdrawApprovalsStore = create<EthWithdrawApprovalStore>(
  (set, get) => ({
    transactions: [] as EthWithdrawalApprovalState[],
    create: (
      withdrawal: EthWithdrawalApprovalState['withdrawal'],
      approval?: EthWithdrawalApprovalState['approval']
    ) => {
      const transactions = get().transactions;
      const now = new Date();
      const transaction: EthWithdrawalApprovalState = {
        id: transactions.length,
        createdAt: now,
        updatedAt: now,
        status: ApprovalStatus.Idle,
        withdrawal,
        approval,
        dialogOpen: false,
      };
      // dismiss possible vega transaction dialog/toast
      const vegaTransaction = useVegaTransactionStore
        .getState()
        .transactions.find((t) => t?.withdrawal?.id === withdrawal.id);
      if (vegaTransaction) {
        useVegaTransactionStore.getState().dismiss(vegaTransaction.id);
      }
      set({ transactions: transactions.concat(transaction) });
      return transaction.id;
    },
    update: (
      id: EthWithdrawalApprovalState['id'],
      update?: Partial<
        Pick<
          EthWithdrawalApprovalState,
          | 'approval'
          | 'status'
          | 'message'
          | 'threshold'
          | 'completeTimestamp'
          | 'dialogOpen'
        >
      >
    ) =>
      set({
        transactions: produce(get().transactions, (draft) => {
          const transaction = draft.find(
            (transaction) => transaction?.id === id
          );
          if (transaction) {
            Object.assign(transaction, { dialogOpen: true, ...update });
            transaction.updatedAt = new Date();
          }
        }),
      }),
    dismiss: (index: number) => {
      set(
        produce((state: EthWithdrawApprovalStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            transaction.dialogOpen = false;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
  })
);

export const useWithdrawApprovalsManager = () => {
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
  if (!transaction) {
    return;
  }
  processed.current.add(transaction.id);
  (async () => {
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

    const threshold = await getThreshold(withdrawal.asset);

    if (threshold && amount.isGreaterThan(threshold)) {
      const delaySecs = await getDelay();
      const completeTimestamp =
        new Date(withdrawal.createdTimestamp).getTime() + delaySecs * 1000;

      if (Date.now() < completeTimestamp) {
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
        message: t(`Withdraw dependencies not met.`),
      });
      return;
    }
    update(transaction.id, {
      status: ApprovalStatus.Ready,
      approval,
      dialogOpen: false,
    });
    const assetId = transaction.withdrawal.asset.id;
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
      ],
      assetId
    );
  })();
};
