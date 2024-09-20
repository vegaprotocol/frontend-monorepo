import { type AssetERC20 } from '@vegaprotocol/assets';
import { type TxCommon, type DefaultSlice } from './use-evm-tx';
import { type Address, type TransactionReceipt } from 'viem';
import { type StoreApi } from 'zustand';
import {
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
} from '@wagmi/core';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { wagmiConfig } from '../wagmi-config';
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

export type TxWithdraw = TxCommon & {
  kind: 'withdrawAsset';
  asset: AssetERC20;
  approval: Approval;
  error?: Error;
  hash?: string;
  receipt?: TransactionReceipt;
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
        asset: config.asset,
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
      get().setTx(id, {
        status: 'error',
        error: err instanceof Error ? err : new Error('withdraw failed'),
      });
    }

    return get().txs.get(id) as TxWithdraw;
  },
});
