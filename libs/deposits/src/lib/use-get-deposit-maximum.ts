import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/assets';
import { addDecimal } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';
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

export const useIsExemptDepositor = (
  contract: CollateralBridge | null,
  address: string | undefined
) => {
  const isExemptDepositor = useCallback(async () => {
    if (!contract || !address) {
      return false;
    }
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('is exempted depositor', { address });
      const res = await contract.is_exempt_depositor(address);
      return res;
    } catch (err) {
      logger.error('is exempted depositor', err);
      return false;
    }
  }, [contract, address]);

  return isExemptDepositor;
};
