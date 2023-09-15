import sortBy from 'lodash/sortBy';
import type { WithdrawalArgs } from './withdraw-form';
import { WithdrawForm } from './withdraw-form';
import type { Asset } from '@vegaprotocol/assets';
import type { AccountFieldsFragment } from '@vegaprotocol/accounts';
import { useWithdrawAsset } from './use-withdraw-asset';

export interface WithdrawManagerProps {
  assets: Asset[];
  accounts: AccountFieldsFragment[];
  submit: (args: WithdrawalArgs) => void;
  assetId?: string;
}

export const WithdrawManager = ({
  assets,
  accounts,
  submit,
  assetId,
}: WithdrawManagerProps) => {
  const { asset, balance, min, threshold, delay, handleSelectAsset } =
    useWithdrawAsset(assets, accounts, assetId);
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
