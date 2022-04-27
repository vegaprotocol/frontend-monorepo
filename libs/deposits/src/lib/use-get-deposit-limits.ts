import type BigNumber from 'bignumber.js';
import { useCallback } from 'react';
import type { VegaErc20Bridge } from '@vegaprotocol/smart-contracts-sdk';
import type { Asset } from './deposit-manager';
import { useEthereumReadContract } from '@vegaprotocol/web3';

interface Limits {
  min: BigNumber;
  max: BigNumber;
}

export const useGetDepositLimits = (
  contract: VegaErc20Bridge | null,
  asset?: Asset
): Limits | null => {
  const getLimits = useCallback(async () => {
    if (!contract || !asset) {
      return;
    }

    return Promise.all([
      contract.getDepositMinimum(asset.source.contractAddress, asset.decimals),
      contract.getDepositMaximum(asset.source.contractAddress, asset.decimals),
    ]);
  }, [asset, contract]);

  const {
    state: { data },
  } = useEthereumReadContract<[BigNumber, BigNumber] | undefined>(getLimits);

  if (!data) return null;

  return {
    min: data[0],
    max: data[1],
  };
};
