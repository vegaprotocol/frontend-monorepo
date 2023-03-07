import { isAssetTypeERC20, removeDecimal } from '@vegaprotocol/utils';
import {
  EthTxStatus,
  useEthereumConfig,
  useEthTransactionStore,
  useTokenContract,
} from '@vegaprotocol/web3';
import type { Asset } from '@vegaprotocol/assets';
import { useEffect, useState } from 'react';

export const useSubmitApproval = (
  asset: Asset | undefined,
  getBalances: () => void
) => {
  const [id, setId] = useState<number | null>(null);
  const createEthTransaction = useEthTransactionStore((state) => state.create);
  const tx = useEthTransactionStore((state) => {
    return state.transactions.find((t) => t?.id === id);
  });
  const { config } = useEthereumConfig();
  const contract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined,
    true
  );

  // When tx is confirmed refresh balances
  useEffect(() => {
    if (tx?.status === EthTxStatus.Confirmed) {
      getBalances();
    }
  }, [tx?.status, getBalances]);

  return {
    id,
    reset: () => {
      setId(null);
    },
    perform: () => {
      if (!asset || !config) return;
      const amount = removeDecimal('1000000', asset.decimals);
      const id = createEthTransaction(contract, 'approve', [
        config?.collateral_bridge_contract.address,
        amount,
      ]);
      setId(id);
    },
  };
};
