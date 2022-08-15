import { useCallback } from 'react';
import { useBridgeContract, useEthereumReadContract } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/react-helpers';
import { addDecimal } from '@vegaprotocol/react-helpers';

export const useGetWithdrawLimits = (asset?: Asset) => {
  const contract = useBridgeContract(true);
  const getLimits = useCallback(async () => {
    if (!contract || !asset || asset.source.__typename !== 'ERC20') {
      return;
    }

    return contract.get_withdraw_threshold(asset.source.contractAddress);
  }, [asset, contract]);

  const {
    state: { data },
  } = useEthereumReadContract(getLimits);

  if (!data || !asset) return null;

  const value = new BigNumber(addDecimal(data.toString(), asset.decimals));
  const max = value.isEqualTo(0)
    ? new BigNumber(Infinity)
    : value.minus(new BigNumber(addDecimal('1', asset.decimals)));
  return {
    max,
  };
};
