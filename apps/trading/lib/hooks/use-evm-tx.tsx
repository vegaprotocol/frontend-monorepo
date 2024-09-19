import { create } from 'zustand';
import {
  getTransactionConfirmations,
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
} from '@wagmi/core';
import { type Address, type TransactionReceipt } from 'viem';

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
import { getErc20Abi } from '../utils/get-erc20-abi';
import {
  BRIDGE_ABI,
  ERC20_ABI,
  prepend0x,
} from '@vegaprotocol/smart-contracts';
import { removeDecimal } from '@vegaprotocol/utils';

type Status =
  | 'idle'
  | 'switch'
  | 'requested'
  | 'pending'
  | 'complete' // complete on foregin chain
  | 'finalized' // finalized on vega
  | 'error';

export type TxWithdraw = {
  kind: 'withdrawAsset';
  id: string;
  status: Status;
  chainId: number;
  confirmations: number;
  requiredConfirmations: number;
  hash?: string;
  receipt?: TransactionReceipt;
};

export type TxFaucet = {
  kind: 'faucet';
  id: string;
  status: Status;
  chainId: number;
  confirmations: number;
  requiredConfirmations: number;
  hash?: string;
  receipt?: TransactionReceipt;
};

export type TxDeposit = {
  kind: 'depositAsset';
  id: string;
  status: Status;
  chainId: number;
  confirmations: number;
  requiredConfirmations: number;
  approveHash?: string;
  approveReceipt?: TransactionReceipt;
  depositHash?: string;
  depositReceipt?: TransactionReceipt;
};

export type Tx = TxDeposit | TxWithdraw | TxFaucet;

type FaucetConfig = {
  asset: AssetERC20;
  chainId: number;
};

type DepositConfig = {
  asset: AssetERC20;
  bridgeAddress: Address;
  amount: string;
  allowance: string;
  toPubKey: string;
  chainId: number;
  requiredConfirmations?: number;
};

// eslint-disable-next-line
type SquidDepositConfig = {};

type WithdrawConfig = {
  asset: AssetERC20;
  bridgeAddress: Address;
  chainId: number;
  requiredConfirmations?: number;
  approval: {
    assetSource: string;
    amount: string;
    nonce: string;
    signatures: string;
    targetAddress: string;
    creation: string;
  };
};

// TODO: we may want to actually update a store of the tx
export const useEvmTxStore = create<{
  txs: Map<string, Tx>;
  setTx: (id: string, tx: Partial<Tx>) => void;
  faucet: (id: string, config: FaucetConfig) => Promise<Tx | undefined>;
  deposit: (id: string, config: DepositConfig) => Promise<Tx | undefined>;
  squidDeposit: (
    id: string,
    config: SquidDepositConfig
  ) => Promise<Tx | undefined>;
  withdraw: (id: string, config: WithdrawConfig) => Promise<Tx | undefined>;
}>()((set, get) => ({
  txs: new Map(),
  setTx: (id, tx) => {
    set((prev) => {
      const curr = prev.txs.get(id);
      const newTx = {
        ...curr,
        ...tx,
      };
      return {
        txs: new Map(prev.txs).set(id, newTx as Tx),
      };
    });
  },
  faucet: async (id, config) => {
    try {
      get().setTx(id, {
        kind: 'faucet',
        id,
        status: 'idle',
        confirmations: 0,
        requiredConfirmations: 1,
        chainId: config.chainId,
      });

      const asset = config.asset;
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

      get().setTx(id, {
        status: 'requested',
      });
      useToasts.getState().setToast({
        id,
        intent: Intent.Warning,
        content: <p>Approve faucet</p>,
      });

      const faucetHash = await writeContract(wagmiConfig, {
        abi: ERC20_ABI,
        address: asset.source.contractAddress as Address,
        functionName: 'faucet',
        chainId: Number(asset.source.chainId),
      });

      get().setTx(id, {
        status: 'pending',
        hash: faucetHash,
      });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <p>Waiting for faucet</p>,
        loader: true,
      });

      const faucetReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: faucetHash,
        confirmations: 1,
        timeout: 1000 * 60 * 5,
      });

      get().setTx(id, {
        status: 'finalized',
        receipt: faucetReceipt,
      });
      useToasts.getState().update(id, {
        intent: Intent.Success,
        content: <p>Faucet complete</p>,
      });
    } catch (err) {
      console.error(err);
    }

    return get().txs.get(id);
  },
  deposit: async (id, config) => {
    try {
      const requiredConfirmations = config.requiredConfirmations || 1;
      const asset = config.asset;

      get().setTx(id, {
        kind: 'depositAsset',
        id,
        status: 'idle',
        confirmations: 0,
        requiredConfirmations,
        chainId: config.chainId,
      });
      const assetChainId = Number(asset.source.chainId);
      const chainId = getChainId(wagmiConfig);

      const amount = removeDecimal(config.amount, config.asset.decimals);
      const allowance = removeDecimal(config.allowance, config.asset.decimals);

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

      if (BigInt(amount) > BigInt(allowance)) {
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

      useToasts.getState().update(id, {
        content: <Toasts.Error />,
        intent: Intent.Danger,
        loader: false,
      });
    }

    return get().txs.get(id);
  },
  squidDeposit: async (id: string, config) => {
    return get().txs.get(id);
  },
  withdraw: async (id: string, config) => {
    try {
      const asset = config.asset;
      const assetChainId = Number(asset.source.chainId);
      const chainId = getChainId(wagmiConfig);

      get().setTx(id, {
        kind: 'withdrawAsset',
        id,
        status: 'idle',
        confirmations: 0,
        requiredConfirmations: 1,
        chainId: config.chainId,
      });

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

      get().setTx(id, {
        status: 'requested',
      });
      useToasts.getState().setToast({
        id,
        intent: Intent.Warning,
        content: <p>Approve withdraw</p>,
      });

      const withdrawHash = await writeContract(wagmiConfig, {
        abi: BRIDGE_ABI,
        address: asset.source.contractAddress as Address,
        functionName: 'withdrawAsset',
        args: [
          config.approval.assetSource,
          config.approval.amount,
          config.approval.targetAddress,
          config.approval.creation,
          config.approval.nonce,
          config.approval.signatures,
        ],
        chainId: Number(asset.source.chainId),
      });

      get().setTx(id, {
        hash: withdrawHash,
        status: 'pending',
      });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <p>Waiting for withdraw</p>,
        loader: true,
      });

      const withdrawReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: withdrawHash,
        confirmations: 1,
        timeout: 1000 * 60 * 5,
      });

      get().setTx(id, {
        receipt: withdrawReceipt,
        status: 'finalized',
      });
      useToasts.getState().update(id, {
        intent: Intent.Success,
        content: <p>Withdraw complete</p>,
      });
    } catch (err) {
      console.error(err);
    }

    return get().txs.get(id);
  },
}));

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
