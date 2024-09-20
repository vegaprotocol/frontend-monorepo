import { type AssetERC20 } from '@vegaprotocol/assets';
import { type TransactionReceipt, type Address } from 'viem';
import { type StoreApi } from 'zustand';
import { removeDecimal } from '@vegaprotocol/utils';
import {
  getTransactionConfirmations,
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
} from '@wagmi/core';

import * as Toasts from '../../components/toasts';
import { getApolloClient } from '../apollo-client';
import { wagmiConfig } from '../wagmi-config';
import { type DefaultSlice, type Tx, type Status } from './use-evm-tx';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { BRIDGE_ABI, prepend0x } from '@vegaprotocol/smart-contracts';
import {
  DepositBusEventDocument,
  type DepositBusEventSubscription,
  type DepositBusEventSubscriptionVariables,
} from '@vegaprotocol/web3';
import { getErc20Abi } from '../utils/get-erc20-abi';
import { DepositStatus } from '@vegaprotocol/types';

type DepositConfig = {
  asset: AssetERC20;
  bridgeAddress: Address;
  amount: string;
  allowance: string;
  toPubKey: string;
  chainId: number;
  requiredConfirmations?: number;
};

export type TxDeposit = {
  kind: 'depositAsset';
  id: string;
  status: Status | 'complete';
  chainId: number;
  confirmations: number;
  requiredConfirmations: number;
  amount: string;
  allowance: string;
  pubKey: string;
  asset: AssetERC20;
  approvalRequired: boolean;
  error?: Error;
  approveHash?: string;
  approveReceipt?: TransactionReceipt;
  depositHash?: string;
  depositReceipt?: TransactionReceipt;
};

export type DepositSlice = {
  deposit: (id: string, config: DepositConfig) => Promise<Tx | undefined>;
};

export const createEvmDepositSlice = (
  set: StoreApi<DepositSlice & DefaultSlice>['setState'],
  get: StoreApi<DepositSlice & DefaultSlice>['getState']
) => ({
  deposit: async (id: string, config: DepositConfig) => {
    try {
      const requiredConfirmations = config.requiredConfirmations || 1;
      const asset = config.asset;
      const amount = removeDecimal(config.amount, asset.decimals);
      const allowance = removeDecimal(config.allowance, asset.decimals);
      const approvalRequired = BigInt(amount) > BigInt(allowance);
      const tx = {
        kind: 'depositAsset',
        id,
        status: 'idle',
        asset: config.asset,
        amount,
        allowance,
        approvalRequired,
        pubKey: config.toPubKey,
        confirmations: 0,
        requiredConfirmations,
        chainId: config.chainId,
      } as const;

      get().setTx(id, tx);
      const assetChainId = Number(asset.source.chainId);
      const chainId = getChainId(wagmiConfig);

      if (assetChainId !== chainId) {
        get().setTx(id, {
          status: 'switch',
        });
        useToasts.getState().setToast({
          id,
          intent: Intent.Warning,
          content: <p>Switch chain</p>,
        });

        await switchChain(wagmiConfig, {
          chainId: assetChainId,
        });
      }

      if (approvalRequired) {
        get().setTx(id, {
          status: 'requested',
        });
        useToasts.getState().setToast({
          id,
          intent: Intent.Warning,
          content: <p>Approve spending on bridge</p>,
        });

        const approveHash = await writeContract(wagmiConfig, {
          abi: getErc20Abi({ address: asset.source.contractAddress }),
          address: asset.source.contractAddress as Address,
          functionName: 'approve',
          args: [config.bridgeAddress, BigInt(amount)],
          chainId: Number(asset.source.chainId),
        });

        get().setTx(id, {
          approveHash,
          status: 'pending',
        });
        useToasts.getState().update(id, {
          intent: Intent.Warning,
          content: <p>Waiting for approval confirmation</p>,
        });

        const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: approveHash,
          confirmations: 1,
          timeout: 1000 * 60 * 5,
        });

        get().setTx(id, {
          approveReceipt,
        });
      }

      get().setTx(id, {
        status: 'requested',
      });
      useToasts.getState().setToast({
        id,
        intent: Intent.Warning,
        content: <p>Confirm deposit</p>,
      });

      const depositHash = await writeContract(wagmiConfig, {
        abi: BRIDGE_ABI,
        address: config.bridgeAddress as `0x${string}`,
        functionName: 'depositAsset',
        args: [
          asset.source.contractAddress,
          amount,
          prepend0x(config.toPubKey),
        ],
        chainId: Number(asset.source.chainId),
      });

      get().setTx(id, {
        depositHash,
        status: 'pending',
      });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <p>Pending deposit</p>,
      });

      const depositReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: depositHash,
        confirmations: 1,
        timeout: 1000 * 60 * 5,
      });

      get().setTx(id, {
        depositReceipt,
        status: 'complete',
      });

      if (requiredConfirmations > 1) {
        await waitForConfirmations(depositHash, requiredConfirmations, (x) => {
          useToasts.getState().update(id, {
            intent: Intent.Warning,
            content: (
              <p>
                Confirmation {x}/{requiredConfirmations}
              </p>
            ),
          });
        });
      }

      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <p>Processing deposit</p>,
      });

      const client = getApolloClient();
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
            if (
              e.event.__typename === 'Deposit' &&
              e.event.txHash === depositHash
            ) {
              return true;
            }
            return false;
          });

          if (event && event.event.__typename === 'Deposit') {
            if (event.event.status === DepositStatus.STATUS_FINALIZED) {
              get().setTx(id, {
                status: 'finalized',
              });
              useToasts.getState().update(id, {
                intent: Intent.Success,
                // content: <Toasts.FinalizedDeposit tx={get().txs.get(id)} />,
                content: <p>complete</p>,
                loader: false,
              });
              sub.unsubscribe();
            }
          }
        });
    } catch (err) {
      console.error(err);
      get().setTx(id, {
        status: 'error',
        error: err instanceof Error ? err : new Error('deposit failed'),
      });

      useToasts.getState().update(id, {
        content: <Toasts.Error />,
        intent: Intent.Danger,
        loader: false,
      });
    }

    return get().txs.get(id);
  },
});

// recursively get confirmations and sleep for 12 seconds before
// running again until required confirmations are met
const waitForConfirmations = async (
  hash: `0x${string}`,
  requiredConfirmations = 1,
  callback?: (confirmation: number) => void
) => {
  const c = await getTransactionConfirmations(wagmiConfig, {
    hash,
  });
  const confirmations = Number(c);

  if (typeof callback === 'function') {
    callback(confirmations);
  }

  if (confirmations >= requiredConfirmations) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 1000 * 5));

  await waitForConfirmations(hash, requiredConfirmations);
};
