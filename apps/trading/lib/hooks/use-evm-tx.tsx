import uniqueId from 'lodash/uniqueId';
import { create } from 'zustand';
import {
  getTransactionConfirmations,
  writeContract,
  waitForTransactionReceipt,
} from '@wagmi/core';
import { type TransactionReceipt } from 'viem';

import { Intent, truncateMiddle, useToasts } from '@vegaprotocol/ui-toolkit';
import {
  DepositBusEventDocument,
  type DepositBusEventSubscription,
  type DepositBusEventSubscriptionVariables,
} from '@vegaprotocol/web3';
import { DepositStatus } from '@vegaprotocol/types';

import { wagmiConfig } from '../wagmi-config';
import { getApolloClient } from '../apollo-client';

type Tx = {
  hash: string;
  confirmations: number;
};

export const useEvmTx = create<{
  txs: Map<string, Tx>;
  updateTx: (id: string, data: Partial<Tx>) => void;
  writeContract: (
    config: Parameters<typeof writeContract>[1],
    requiredConfirmations?: number
  ) => Promise<TransactionReceipt | undefined>;
}>()((set, get) => ({
  txs: new Map(),
  updateTx: (id, data) => {
    set((prev) => {
      const curr = prev.txs.get(id);

      if (curr) {
        return {
          txs: new Map(prev.txs).set(id, {
            ...curr,
            ...data,
          }),
        };
      }

      return {
        txs: new Map(prev.txs).set(id, {
          hash: '',
          confirmations: 0,
          ...data,
        }),
      };
    });
  },
  writeContract: async (config, requiredConfirmations = 1) => {
    const id = uniqueId();
    const txStore = get();
    const toastStore = useToasts.getState();

    toastStore.setToast({
      id,
      intent: Intent.Warning,
      content: <p>Confirm in wallet</p>,
    });

    let hash: `0x${string}`;

    try {
      hash = await writeContract(wagmiConfig, config);

      txStore.updateTx(id, { hash });

      toastStore.update(id, {
        content: <div>Hash: {truncateMiddle(hash)}</div>,
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
          content: <p>{err.shortMessage}</p>,
          intent: Intent.Danger,
        });
      } else {
        toastStore.update(id, {
          content: <p>Something went wrong</p>,
          intent: Intent.Danger,
        });
      }

      return;
    }

    if (!hash) {
      return;
    }

    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

    if (requiredConfirmations > 1) {
      await waitForConfirmations(id, hash, requiredConfirmations);
    }

    // If its a deposit, we need to wait until the deposit has arrived on the network
    if (config.functionName === 'deposit_asset') {
      // TODO: ensure toast re-pops if its been closed, but only on confirmation
      return new Promise((resolve) => {
        const client = getApolloClient();
        // poll or subscribe to depoist events
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
                  content: <p>Deposit confirmed</p>,
                });
                sub.unsubscribe();
                resolve(receipt);
              }
            }
          });
      });
    }

    return receipt;
  },
}));

const waitForConfirmations = (
  id: string,
  hash: `0x${string}`,
  requiredConfirmations: number
): Promise<bigint> => {
  return new Promise((resolve, reject) => {
    const txStore = useEvmTx.getState();
    const toastStore = useToasts.getState();
    // Start checking confirmations
    const interval = setInterval(async () => {
      try {
        const confirmations = await getTransactionConfirmations(wagmiConfig, {
          hash,
        });

        txStore.updateTx(id, {
          confirmations: Number(confirmations),
        });

        toastStore.update(id, {
          content: (
            <p>
              {Number(confirmations)}/{requiredConfirmations}
            </p>
          ),
        });

        if (confirmations >= BigInt(requiredConfirmations)) {
          clearInterval(interval);
          resolve(confirmations);
        }
      } catch {
        clearInterval(interval);
        reject();
      }
    }, 1000 * 12);
  });
};
