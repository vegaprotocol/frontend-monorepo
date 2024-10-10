import { type AssetERC20 } from '@vegaprotocol/assets';
import { type TxCommon, type DefaultSlice } from './evm';
import { type Address, type TransactionReceipt } from 'viem';
import { type StoreApi } from 'zustand';
import {
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
} from '@wagmi/core';
import * as Toasts from '../../components/toasts';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { wagmiConfig } from '../../lib/wagmi-config';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';

type Approval = {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
  creation: string;
};

type WithdrawConfig = {
  asset: AssetERC20;
  bridgeAddress: Address;
  chainId: number;
  requiredConfirmations?: number;
  approval: Approval;
};

type WithdrawData = {
  asset: AssetERC20;
  approval: Approval;
  hash?: string;
  receipt?: TransactionReceipt;
};

export type TxWithdraw = TxCommon & {
  kind: 'withdrawAsset';
  data?: WithdrawData;
};

export type WithdrawSlice = {
  withdraw: (
    id: string,
    config: WithdrawConfig
  ) => Promise<TxWithdraw | undefined>;
};

export const createEvmWithdrawSlice = (
  set: StoreApi<WithdrawSlice & DefaultSlice>['setState'],
  get: StoreApi<WithdrawSlice & DefaultSlice>['getState']
) => ({
  withdraw: async (id: string, config: WithdrawConfig) => {
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
        data: {
          asset: config.asset,
        },
      });

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

      get().setTx(id, {
        status: 'requested',
      });
      useToasts.getState().setToast({
        id,
        intent: Intent.Warning,
        content: <Toasts.Requested />,
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
        status: 'pending',
        data: { hash: withdrawHash },
      });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <Toasts.Pending tx={get().txs.get(id)} />,
        loader: true,
      });

      const withdrawReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: withdrawHash,
        confirmations: 1,
        timeout: 1000 * 60 * 5,
      });

      get().setTx(id, {
        status: 'finalized',
        data: { receipt: withdrawReceipt },
      });
      useToasts.getState().update(id, {
        intent: Intent.Success,
        content: <Toasts.FinalizedGeneric tx={get().txs.get(id)} />,
        loader: false,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('withdraw failed');
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

    return get().txs.get(id) as TxWithdraw;
  },
});
