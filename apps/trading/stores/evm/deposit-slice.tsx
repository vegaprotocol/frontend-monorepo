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
import { getApolloClient } from '../../lib/apollo-client';
import { wagmiConfig } from '../../lib/wagmi-config';
import { type DefaultSlice, type TxCommon } from './evm';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { BRIDGE_ABI, prepend0x } from '@vegaprotocol/smart-contracts';
import {
  DepositBusEventDocument,
  type DepositBusEventSubscription,
  type DepositBusEventSubscriptionVariables,
} from '@vegaprotocol/web3';
import { getErc20Abi } from '../../lib/utils/get-erc20-abi';
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

type DepositData = {
  amount: string;
  allowance: string;
  pubKey: string;
  asset: AssetERC20;
  approvalRequired: boolean;
  approveHash?: string;
  approveReceipt?: TransactionReceipt;
  depositHash?: string;
  depositReceipt?: TransactionReceipt;
};

export type TxDeposit = Omit<TxCommon, 'status'> & {
  kind: 'depositAsset';
  status: TxCommon['status'] | 'complete';
  data?: DepositData;
};

export type DepositSlice = {
  deposit: (id: string, config: DepositConfig) => Promise<TxDeposit>;
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
        confirmations: 0,
        requiredConfirmations,
        chainId: config.chainId,
        data: {
          asset: config.asset,
          amount,
          allowance,
          approvalRequired,
          pubKey: config.toPubKey,
        },
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
          content: <Toasts.SwitchChain />,
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
          content: <Toasts.Approve />,
        });

        const approveHash = await writeContract(wagmiConfig, {
          abi: getErc20Abi({ address: asset.source.contractAddress }),
          address: asset.source.contractAddress as Address,
          functionName: 'approve',
          args: [config.bridgeAddress, BigInt(amount)],
          chainId: Number(asset.source.chainId),
        });

        get().setTx(id, {
          status: 'pending',
          data: {
            approveHash,
          },
        });
        useToasts.getState().update(id, {
          intent: Intent.Warning,
          content: <Toasts.Pending tx={get().txs.get(id)} />,
          loader: true,
        });

        const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: approveHash,
          confirmations: 1,
          timeout: 1000 * 60 * 5,
        });

        get().setTx(id, {
          data: { approveReceipt },
        });
      }

      get().setTx(id, {
        status: 'requested',
      });
      useToasts.getState().setToast({
        id,
        intent: Intent.Warning,
        content: <Toasts.Requested />,
        loader: false,
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
        status: 'pending',
        data: { depositHash },
      });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <Toasts.Pending tx={get().txs.get(id)} />,
        loader: true,
      });

      const depositReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: depositHash,
        confirmations: 1,
        timeout: 1000 * 60 * 5,
      });

      get().setTx(id, {
        status: 'complete',
        data: { depositReceipt },
      });

      if (requiredConfirmations > 1) {
        await waitForConfirmations(depositHash, requiredConfirmations, (x) => {
          useToasts.getState().update(id, {
            intent: Intent.Warning,
            content: <Toasts.Pending tx={get().txs.get(id)} />,
          });
        });
      }

      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: (
          <Toasts.ConfirmingDeposit tx={get().txs.get(id) as TxDeposit} />
        ),
      });

      await waitForDepositEvent({ pubKey: config.toPubKey, hash: depositHash });

      get().setTx(id, {
        status: 'finalized',
      });
      useToasts.getState().update(id, {
        intent: Intent.Success,
        content: (
          <Toasts.FinalizedDeposit tx={get().txs.get(id) as TxDeposit} />
        ),
        loader: false,
      });

      return get().txs.get(id) as TxDeposit;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('deposit failed');
      get().setTx(id, {
        status: 'error',
        error,
      });

      useToasts.getState().update(id, {
        content: <Toasts.Error message={error.message} />,
        intent: Intent.Danger,
        loader: false,
      });
    }

    return get().txs.get(id) as TxDeposit;
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

/**
 * Start a subscription and wait for the deposit event with the same txHash
 * so we can finalize the deposit
 */
const waitForDepositEvent = async (args: { pubKey: string; hash: string }) => {
  const apolloClient = getApolloClient();

  return new Promise((resolve) => {
    const sub = apolloClient
      .subscribe<
        DepositBusEventSubscription,
        DepositBusEventSubscriptionVariables
      >({
        query: DepositBusEventDocument,
        variables: { partyId: args.pubKey },
      })
      .subscribe(({ data }) => {
        if (!data?.busEvents?.length) return;

        const event = data.busEvents.find((e) => {
          if (
            e.event.__typename === 'Deposit' &&
            e.event.txHash === args.hash
          ) {
            return true;
          }
          return false;
        });

        if (
          event &&
          event.event.__typename === 'Deposit' &&
          event.event.status === DepositStatus.STATUS_FINALIZED
        ) {
          sub.unsubscribe();
          resolve(true);
        }
      });
  });
};
