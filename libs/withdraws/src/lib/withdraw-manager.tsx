import { useMemo, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { WithdrawForm } from './withdraw-form';
import { useCreateWithdraw } from './use-create-withdraw';
import type { Asset } from '@vegaprotocol/react-helpers';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import type { Account } from './types';
import { useGetWithdrawLimits } from './use-get-withdraw-limits';
import { VegaDialog } from '@vegaprotocol/wallet';

export interface WithdrawManagerProps {
  assets: Asset[];
  accounts: Account[];
}

export const WithdrawManager = ({ assets, accounts }: WithdrawManagerProps) => {
  const { submit, transaction } = useCreateWithdraw();
  const [assetId, setAssetId] = useState<string | undefined>();

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

  const limits = useGetWithdrawLimits(asset);

  const max = useMemo(() => {
    if (!asset) {
      return {
        balance: new BigNumber(0),
        threshold: new BigNumber(0),
      };
    }

    const balance = account
      ? new BigNumber(addDecimal(account.balance, asset.decimals))
      : new BigNumber(0);

    return {
      balance,
      threshold: limits ? limits.max : new BigNumber(Infinity),
    };
  }, [asset, account, limits]);

  const min = useMemo(() => {
    return asset
      ? new BigNumber(addDecimal('1', asset.decimals))
      : new BigNumber(0);
  }, [asset]);

  if (transaction.dialogOpen) {
    return <VegaDialog transaction={transaction} />;
  }

  return (
    <WithdrawForm
      selectedAsset={asset}
      onSelectAsset={(id) => setAssetId(id)}
      assets={sortBy(assets, 'name')}
      max={max}
      min={min}
      submitWithdraw={submit}
      limits={limits}
    />
  );
};
