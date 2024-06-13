import {
  EthTxStatus,
  useEthTransactionStore,
  useTokenContract,
} from '@vegaprotocol/web3';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import type { Asset } from '@vegaprotocol/assets';
import { useBalancesStore } from '@vegaprotocol/assets';
import { useEffect, useState } from 'react';

export const useSubmitFaucet = (
  asset: Asset | undefined,
  onTransactionConfirmed: () => void
) => {
  const [id, setId] = useState<number | null>(null);
  const createEthTransaction = useEthTransactionStore((state) => state.create);
  const tx = useEthTransactionStore((state) => {
    return state.transactions.find((t) => t?.id === id);
  });

  const assetData = isAssetTypeERC20(asset)
    ? {
        contractAddress: asset.source.contractAddress,
        chainId: Number(asset.source.chainId),
      }
    : undefined;
  const { contract } = useTokenContract(assetData);

  // When tx is confirmed refresh balances
  useEffect(() => {
    if (tx?.status === EthTxStatus.Confirmed) {
      onTransactionConfirmed();
      if (asset) useBalancesStore.getState().refetch(asset.id);
    }
  }, [tx?.status, onTransactionConfirmed, asset]);

  return {
    id,
    reset: () => {
      setId(null);
    },
    perform: () => {
      if (!contract) return;
      const id = createEthTransaction(contract, 'faucet', []);
      setId(id);
    },
  };
};
