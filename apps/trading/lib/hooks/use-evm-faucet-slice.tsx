import { type AssetERC20 } from '@vegaprotocol/assets';
import { type DefaultSlice, type TxCommon } from './use-evm-tx';
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
import { ERC20_ABI } from '@vegaprotocol/smart-contracts';

type FaucetConfig = {
  asset: AssetERC20;
  chainId: number;
};

export type TxFaucet = TxCommon & {
  kind: 'faucet';
  asset: AssetERC20;
  error?: Error;
  hash?: string;
  receipt?: TransactionReceipt;
};

export type FaucetSlice = {
  faucet: (id: string, config: FaucetConfig) => Promise<TxFaucet>;
};

export const createEvmFaucetSlice = (
  set: StoreApi<FaucetSlice & DefaultSlice>['setState'],
  get: StoreApi<FaucetSlice & DefaultSlice>['getState']
) => ({
  faucet: async (id: string, config: FaucetConfig) => {
    try {
      get().setTx(id, {
        kind: 'faucet',
        id,
        status: 'idle',
        asset: config.asset,
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
      get().setTx(id, {
        status: 'error',
        error: err instanceof Error ? err : new Error('faucet failed'),
      });
    }

    return get().txs.get(id) as TxFaucet;
  },
});
