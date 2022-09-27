import sortBy from 'lodash/sortBy';
import { WithdrawForm } from './withdraw-form';
import type { WithdrawalArgs } from './use-create-withdraw';
import type { Asset } from '@vegaprotocol/react-helpers';
import type { Account } from './types';
import { useWithdrawAsset } from './use-withdraw-asset';

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
