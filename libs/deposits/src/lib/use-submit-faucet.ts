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
  getBalances: () => void
) => {
  const [id, setId] = useState<number | null>(null);
  const createEthTransaction = useEthTransactionStore((state) => state.create);
  const tx = useEthTransactionStore((state) => {
    return state.transactions.find((t) => t?.id === id);
  });
  const contract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined
  );

  // When tx is confirmed refresh balances
  useEffect(() => {
    if (tx?.status === EthTxStatus.Confirmed) {
      getBalances();
      if (asset) useBalancesStore.getState().refetch(asset.id);
    }
  }, [tx?.status, getBalances, asset]);

  return {
    id,
    reset: () => {
      setId(null);
    },
    perform: () => {
      const id = createEthTransaction(contract, 'faucet', []);
      setId(id);
    },
  };
};
