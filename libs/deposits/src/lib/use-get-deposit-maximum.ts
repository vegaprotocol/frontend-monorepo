import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/assets';
import { addDecimal, localLoggerFactory } from '@vegaprotocol/utils';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';

export const useGetDepositMaximum = (
  contract: CollateralBridge | null,
  asset: Asset | undefined
) => {
  const getDepositMaximum = useCallback(async () => {
    if (!contract || !asset || asset.source.__typename !== 'ERC20') {
      return;
    }
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get deposit maximum', { asset: asset.id });
      const res = await contract.get_deposit_maximum(
        asset.source.contractAddress
      );
      const max = new BigNumber(addDecimal(res.toString(), asset.decimals));
      return max.isEqualTo(0) ? new BigNumber(Infinity) : max;
    } catch (err) {
      logger.error('get deposit maximum', err);
      return;
    }
  }, [contract, asset]);

  return getDepositMaximum;
};
