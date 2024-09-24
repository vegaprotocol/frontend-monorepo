import { type AssetERC20 } from '@vegaprotocol/assets';
import { type DefaultSlice, type TxCommon } from './evm';
import { type Address, type TransactionReceipt } from 'viem';
import { type StoreApi } from 'zustand';
import * as Toasts from '../../components/toasts';
import {
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
} from '@wagmi/core';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import { wagmiConfig } from '../../lib/wagmi-config';
import { ERC20_ABI } from '@vegaprotocol/smart-contracts';

type FaucetConfig = {
  asset: AssetERC20;
  chainId: number;
};

type FaucetData = {
  asset: AssetERC20;
  hash?: string;
  receipt?: TransactionReceipt;
};

export type TxFaucet = TxCommon & {
  kind: 'faucet';
  data?: FaucetData;
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
        confirmations: 0,
        requiredConfirmations: 1,
        chainId: config.chainId,
        data: {
          asset: config.asset,
        },
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

      const faucetHash = await writeContract(wagmiConfig, {
        abi: ERC20_ABI,
        address: asset.source.contractAddress as Address,
        functionName: 'faucet',
        chainId: Number(asset.source.chainId),
      });

      get().setTx(id, {
        status: 'pending',
        data: { hash: faucetHash },
      });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <Toasts.Pending tx={get().txs.get(id)} />,
        loader: true,
      });

      const faucetReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: faucetHash,
        confirmations: 1,
        timeout: 1000 * 60 * 5,
      });

      get().setTx(id, {
        status: 'finalized',
        data: { receipt: faucetReceipt },
      });
      useToasts.getState().update(id, {
        intent: Intent.Success,
        content: <Toasts.FinalizedGeneric tx={get().txs.get(id)} />,
        loader: false,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('faucet failed');
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

    return get().txs.get(id) as TxFaucet;
  },
});
