import { useRef } from 'react';
import uniqueId from 'lodash/uniqueId';
import { create } from 'zustand';
import {
  getTransactionConfirmations,
  writeContract,
  waitForTransactionReceipt,
} from '@wagmi/core';
import { type TransactionReceipt } from 'viem';

import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { type AssetERC20 } from '@vegaprotocol/assets';
import {
  DepositBusEventDocument,
  type DepositBusEventSubscription,
  type DepositBusEventSubscriptionVariables,
} from '@vegaprotocol/web3';
import { DepositStatus } from '@vegaprotocol/types';

import { wagmiConfig } from '../wagmi-config';
import { getApolloClient } from '../apollo-client';
import * as Toasts from '../../components/toasts';

type Config = Parameters<typeof writeContract>[1];

type Status =
  | 'idle'
  | 'requested'
  | 'pending'
  | 'complete' // complete on foregin chain
  | 'finalized'; // finalized on vega

type TxMeta =
  | {
      functionName: 'deposit_asset';
      asset: AssetERC20;
      amount: string;
      requiredConfirmations: number;
    }
  | {
      functionName: 'withdraw_asset';
      asset: AssetERC20;
      amount: string;
      requiredConfirmations: number;
    };

export type Tx = {
  id: string;
  hash: string;
  confirmations: number;
  receipt: TransactionReceipt | undefined;
  status: Status;
  isPending: boolean;
  chainId: Config['chainId'];
  meta: TxMeta | undefined;
};

export const useEvmTxStore = create<{
  txs: Map<string, Tx>;
  writeContract: (
    id: string,
    config: Config,
    meta?: TxMeta
  ) => Promise<Tx | undefined>;
}>()((set, get) => ({
  txs: new Map(),
  writeContract: async (id, config, meta) => {
    const updateTx = (id: string, data: Partial<Tx>) => {
      set((prev) => {
        const curr = prev.txs.get(id);

        if (curr) {
          const newData = {
            ...curr,
            ...data,
          };
          newData.isPending =
            newData.status === 'requested' ||
            newData.status === 'pending' ||
            newData.status === 'complete';
          return {
            txs: new Map(prev.txs).set(id, newData),
          };
        }

        return {
          txs: new Map(prev.txs).set(id, {
            id,
            hash: '',
            confirmations: 0,
            receipt: undefined,
            status: 'idle',
            isPending: false,
            chainId: 1,
            meta: undefined,
            ...data,
          }),
        };
      });
    };

    const getTx = (id: string) => get().txs.get(id);

    const toastStore = useToasts.getState();
    const requiredConfirmations = meta?.requiredConfirmations || 1;

    updateTx(id, {
      status: 'requested',
      chainId: config.chainId,
      meta,
    });

    toastStore.setToast({
      id,
      intent: Intent.Warning,
      content: <Toasts.Requested />,
    });

    let hash: `0x${string}`;

    try {
      hash = await writeContract(wagmiConfig, config);

      updateTx(id, { hash, status: 'pending' });

      toastStore.update(id, {
        content: <Toasts.Pending tx={getTx(id)} />,
        loader: true,
      });
    } catch (err) {
      // TODO: create a type guard for this
      if (
        err !== null &&
        typeof err === 'object' &&
        'shortMessage' in err &&
        typeof err.shortMessage === 'string'
      ) {
        toastStore.update(id, {
          content: <Toasts.Error message={err.shortMessage} />,
          intent: Intent.Danger,
          loader: false,
        });
      } else {
        toastStore.update(id, {
          content: <Toasts.Error />,
          intent: Intent.Danger,
          loader: false,
        });
      }

      updateTx(id, { status: 'idle' });

      return;
    }

    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

    updateTx(id, { receipt });

    // recursively get confirmations and sleep for 12 seconds before
    // running again until required confirmations are met
    const waitForConfirmations = async () => {
      const c = await getTransactionConfirmations(wagmiConfig, {
        hash,
      });
      const confirmations = Number(c);

      updateTx(id, { confirmations });

      toastStore.update(id, {
        content: <Toasts.Pending tx={getTx(id)} />,
      });

      if (confirmations >= requiredConfirmations) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * 12));

      await waitForConfirmations();
    };

    if (requiredConfirmations > 1) {
      await waitForConfirmations();
    }

    // If its a deposit, we need to wait until the deposit has arrived on the network
    if (config.functionName === 'deposit_asset') {
      updateTx(id, { receipt, status: 'complete' });

      toastStore.update(id, {
        intent: Intent.Warning,
        content: <Toasts.ConfirmingDeposit tx={getTx(id)} />,
      });

      const client = getApolloClient();
      return new Promise((resolve) => {
        // subscribe to depoist events and update the tx
        // once the deposit is seen as finalized
        const sub = client
          .subscribe<
            DepositBusEventSubscription,
            DepositBusEventSubscriptionVariables
          >({
            query: DepositBusEventDocument,
          })
          .subscribe(({ data }) => {
            if (!data?.busEvents?.length) return;

            const event = data.busEvents.find((e) => {
              if (e.event.__typename === 'Deposit' && e.event.txHash === hash) {
                return true;
              }
              return false;
            });

            if (event && event.event.__typename === 'Deposit') {
              if (event.event.status === DepositStatus.STATUS_FINALIZED) {
                toastStore.update(id, {
                  intent: Intent.Success,
                  content: <Toasts.FinalizedDeposit tx={getTx(id)} />,
                  loader: false,
                });
                updateTx(id, { receipt, status: 'finalized' });
                sub.unsubscribe();
                resolve(get().txs.get(id));
              }
            }
          });
      });
    }

    updateTx(id, { receipt, status: 'finalized' });

    toastStore.update(id, {
      intent: Intent.Success,
      content: <Toasts.FinalizedGeneric tx={getTx(id)} />,
      loader: false,
    });

    return get().txs.get(id);
  },
}));

export const useEvmTx = () => {
  const idRef = useRef<string>(uniqueId());
  const writeContract = useEvmTxStore((store) => store.writeContract);
  const transaction = useEvmTxStore((store) => {
    return store.txs.get(idRef.current);
  });

  return {
    writeContract: (config: Config, meta?: TxMeta) => {
      return writeContract(idRef.current, config, meta);
    },
    data: transaction,
  };
};
