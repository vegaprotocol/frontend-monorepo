import type { Asset } from '@vegaprotocol/assets';
import { addDecimal } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';
import * as Schema from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo } from 'react';
import type { AccountFieldsFragment } from '@vegaprotocol/accounts';
import {
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
} from '@vegaprotocol/web3';
import { useWithdrawStore } from './withdraw-store';
import { useNetworkParam } from '@vegaprotocol/network-parameters';

export const useWithdrawAsset = (
  assets: Asset[],
  accounts: AccountFieldsFragment[],
  assetId?: string
) => {
  const { asset, balance, min, threshold, delay, update } = useWithdrawStore();
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();
  const { param } = useNetworkParam(
    'spam_protection_minimumWithdrawalQuantumMultiple'
  );

  const minimumWithdrawalQuantumMultiple = useMemo(() => {
    const factor = new BigNumber(param || '');
    if (factor.isNaN()) {
      return new BigNumber(1);
    }
    return factor;
  }, [param]);

  // Every time an asset is selected we need to find the corresponding
  // account, balance, min viable amount and delay threshold
  const handleSelectAsset = useCallback(
    async (id: string) => {
      const asset = assets.find((a) => a.id === id);
      const account = accounts.find(
        (a) =>
          a.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL &&
          a.asset.id === asset?.id
      );
      const balance =
        account && asset
          ? new BigNumber(addDecimal(account.balance, asset.decimals))
          : new BigNumber(0);
      const min = asset
        ? BigNumber.max(
            new BigNumber(addDecimal('1', asset.decimals)),
            new BigNumber(addDecimal(asset.quantum, asset.decimals)).times(
              minimumWithdrawalQuantumMultiple
            )
          )
        : new BigNumber(0);
      // Query collateral bridge for threshold for selected asset
      // and subsequent delay if withdrawal amount is larger than it
      let threshold = new BigNumber(0);
      let delay = 0;
      const logger = localLoggerFactory({ application: 'withdraws' });
      try {
        logger.info('get withdraw asset data', { asset: asset?.id });
        const result = await Promise.all([getThreshold(asset), getDelay()]);
        if (result[0] != null) threshold = result[0];
        if (result[1] != null) delay = result[1];
      } catch (err) {
        logger.error('get withdraw asset data', err);
      }

      update({ asset, balance, min, threshold, delay });
    },
    [
      assets,
      accounts,
      minimumWithdrawalQuantumMultiple,
      update,
      getThreshold,
      getDelay,
    ]
  );

  useEffect(() => {
    if (assetId) {
      handleSelectAsset(assetId);
    }
  }, [assetId, handleSelectAsset]);

  return { asset, balance, min, threshold, delay, handleSelectAsset };
};
