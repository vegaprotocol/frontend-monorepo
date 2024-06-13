import { MaxUint256 } from '@ethersproject/constants';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import {
  EthTxStatus,
  useCollateralBridge,
  useEthTransactionStore,
  useTokenContract,
} from '@vegaprotocol/web3';
import type { Asset } from '@vegaprotocol/assets';
import { useEffect, useState } from 'react';

export const useSubmitApproval = (
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
  const { contract: tokenContract } = useTokenContract(assetData);
  const { address } = useCollateralBridge(assetData?.chainId);

  // When tx is confirmed refresh balances
  useEffect(() => {
    if (tx?.status === EthTxStatus.Confirmed) {
      onTransactionConfirmed();
    }
  }, [tx?.status, onTransactionConfirmed]);

  return {
    id,
    reset: () => {
      setId(null);
    },
    perform: (amount?: string) => {
      if (!asset || !address || !tokenContract) return;
      const id = createEthTransaction(tokenContract, 'approve', [
        address,
        amount ? amount : MaxUint256.toString(),
      ]);
      setId(id);
      return;
    },
  };
};
