import { useCallback } from 'react';
import sortBy from 'lodash/sortBy';
import { WithdrawForm } from './withdraw-form';
import type { WithdrawalArgs } from './use-create-withdraw';
import type { Asset } from '@vegaprotocol/react-helpers';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import type { Account } from './types';
import { useGetWithdrawThreshold } from './use-get-withdraw-threshold';
import { captureException } from '@sentry/react';
import { useGetWithdrawDelay } from './use-get-withdraw-delay';
import { useWithdrawStore } from './withdraw-store';

export interface WithdrawManagerProps {
  assets: Asset[];
  accounts: Account[];
  submit: (args: WithdrawalArgs) => void;
  assetId?: string;
}

export const WithdrawManager = ({
  assets,
  accounts,
  submit,
  assetId,
}: WithdrawManagerProps) => {
  const { asset, balance, min, threshold, delay, update } = useWithdrawStore();
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();

  // Every time an asset is selected we need to find the corresponding
  // account, balance, min viable amount and delay threshold
  const handleSelectAsset = useCallback(
    async (id: string) => {
      const asset = assets.find((a) => a.id === id);
      const account = accounts.find(
        (a) =>
          a.type === AccountType.ACCOUNT_TYPE_GENERAL &&
          a.asset.id === asset?.id
      );
      const balance =
        account && asset
          ? new BigNumber(addDecimal(account.balance, asset.decimals))
          : new BigNumber(0);
      const min = asset
        ? new BigNumber(addDecimal('1', asset.decimals))
        : new BigNumber(0);

      // Query collateral bridge for threshold for selected asset
      // and subsequent delay if withdrawal amount is larger than it
      let threshold;
      let delay;

      try {
        const result = await Promise.all([getThreshold(asset), getDelay()]);
        threshold = result[0];
        delay = result[1];
      } catch (err) {
        captureException(err);
      }

      update({ asset, balance, min, threshold, delay });
    },
    [accounts, assets, update, getThreshold, getDelay]
  );

  if (assetId) {
    handleSelectAsset(assetId);
  }

  return (
    <WithdrawForm
      selectedAsset={asset}
      onSelectAsset={handleSelectAsset}
      assets={sortBy(assets, 'name')}
      balance={balance}
      min={min}
      submitWithdraw={submit}
      threshold={threshold}
      delay={delay}
    />
  );
};
