import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/assets';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';

export const useGetDepositMaximum = (
  contract: CollateralBridge | null,
  asset: Asset | undefined
) => {
  const getDepositMaximum = useCallback(async () => {
    if (!contract || !asset || asset.source.__typename !== 'ERC20') {
      return;
    }
    try {
      const res = await contract.get_deposit_maximum(
        asset.source.contractAddress
      );
      const max = new BigNumber(addDecimal(res.toString(), asset.decimals));
      return max.isEqualTo(0) ? new BigNumber(Infinity) : max;
    } catch (err) {
      Sentry.captureException(err);
      return;
    }
  }, [contract, asset]);

  return getDepositMaximum;
};
