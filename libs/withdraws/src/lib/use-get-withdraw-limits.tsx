import { useCallback } from 'react';
import type { Asset } from './types';
import { useBridgeContract, useEthereumReadContract } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';

export const useGetWithdrawaLimits = (asset?: Asset) => {
  const contract = useBridgeContract(true);
  const getLimits = useCallback(async () => {
    if (!contract || !asset || asset.source.__typename !== 'ERC20') {
      return;
    }

    return contract.getWithdrawThreshold(asset.source.contractAddress);
  }, [asset, contract]);

  const {
    state: { data },
  } = useEthereumReadContract(getLimits);

  if (!data || !asset) return null;

  const max = new BigNumber(addDecimal(data.toString(), asset.decimals));

  return {
    max: max.isEqualTo(0) ? new BigNumber(Infinity) : max,
  };
};
