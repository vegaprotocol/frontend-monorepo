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

  const getThreshold = useGetWithdrawThreshold();

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
        const threshold = await getThreshold(asset);

        if (mounted) {
          setThreshold(threshold);
        }
      } catch (err) {
        captureException(err);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [asset, getThreshold]);

  return (
    <WithdrawForm
      selectedAsset={asset}
      onSelectAsset={(id) => setAssetId(id)}
      assets={sortBy(assets, 'name')}
      balance={balance}
      min={min}
      submitWithdraw={submit}
      threshold={threshold}
    />
  );
};
