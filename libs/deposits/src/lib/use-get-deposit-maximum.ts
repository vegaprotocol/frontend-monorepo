import { useCallback } from 'react';
import type { Asset } from './deposit-manager';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type {
  CollateralBridge,
  CollateralBridgeNew,
} from '@vegaprotocol/smart-contracts';

export const useGetDepositMaximum = (
  contract: CollateralBridge | CollateralBridgeNew | null,
  asset: Asset | undefined
) => {
  const getDepositMaximum = useCallback(async () => {
    if (!contract || !asset || asset.source.__typename !== 'ERC20') {
      return;
    }
    const res = await contract.get_deposit_maximum(
      asset.source.contractAddress
    );
    const max = new BigNumber(addDecimal(res.toString(), asset.decimals));
    return max.isEqualTo(0) ? new BigNumber(Infinity) : max;
  }, [contract, asset]);

  return getDepositMaximum;
};
