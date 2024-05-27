import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { localLoggerFactory } from '@vegaprotocol/logger';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';

export const useGetDepositMaximum = (
  contract?: CollateralBridge,
  assetSource?: string
) => {
  const getDepositMaximum = useCallback(async () => {
    if (!contract || !assetSource) {
      return;
    }
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get deposit maximum', { asset: assetSource });
      const res = await contract.get_asset_deposit_lifetime_limit(assetSource);
      const max = new BigNumber(res.toString());
      return max.isEqualTo(0) ? new BigNumber(Infinity) : max;
    } catch (err) {
      logger.error('get deposit maximum', err);
      return;
    }
  }, [contract, assetSource]);

  return getDepositMaximum;
};

export const useIsExemptDepositor = (
  contract?: CollateralBridge,
  accountAddress?: string
) => {
  const isExemptDepositor = useCallback(async () => {
    if (!contract || !accountAddress) {
      return false;
    }
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('is exempted depositor', { address: accountAddress });
      const res = await contract.is_exempt_depositor(accountAddress);
      return res;
    } catch (err) {
      logger.error('is exempted depositor', err);
      return false;
    }
  }, [contract, accountAddress]);

  return isExemptDepositor;
};
