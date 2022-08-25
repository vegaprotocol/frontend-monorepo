import { useEffect, useMemo, useState } from 'react';
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

export interface WithdrawManagerProps {
  assets: Asset[];
  accounts: Account[];
  submit: (args: WithdrawalArgs) => void;
}

export const WithdrawManager = ({
  assets,
  accounts,
  submit,
}: WithdrawManagerProps) => {
  const [assetId, setAssetId] = useState<string | undefined>();
  const [threshold, setThreshold] = useState<BigNumber>(
    new BigNumber(Infinity)
  );
  const [delay, setDelay] = useState<number | null>(null);

  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();

  // Find the asset object from the select box
  const asset = useMemo(() => {
    return assets?.find((a) => a.id === assetId);
  }, [assets, assetId]);

  const account = useMemo(() => {
    return accounts.find(
      (a) =>
        a.type === AccountType.ACCOUNT_TYPE_GENERAL && a.asset.id === asset?.id
    );
  }, [asset, accounts]);

  const balance = useMemo(() => {
    if (!asset || !account) {
      return new BigNumber(0);
    }

    return new BigNumber(addDecimal(account.balance, asset.decimals));
  }, [asset, account]);

  const min = useMemo(() => {
    return asset
      ? new BigNumber(addDecimal('1', asset.decimals))
      : new BigNumber(0);
  }, [asset]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const [threshold, delay] = await Promise.all([
          getThreshold(asset),
          getDelay(),
        ]);

        if (mounted) {
          setThreshold(threshold);
          setDelay(delay);
        }
      } catch (err) {
        captureException(err);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [asset, getThreshold, getDelay]);

  return (
    <WithdrawForm
      selectedAsset={asset}
      onSelectAsset={(id) => setAssetId(id)}
      assets={sortBy(assets, 'name')}
      balance={balance}
      min={min}
      submitWithdraw={submit}
      threshold={threshold}
      delay={delay}
    />
  );
};
