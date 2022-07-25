import { DepositForm } from './deposit-form';
import { useSubmitDeposit } from './use-submit-deposit';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useDepositStore } from './deposit-store';
import { useCallback } from 'react';
import { useDepositBalances } from './use-deposit-balances';

interface ERC20AssetSource {
  __typename: 'ERC20';
  contractAddress: string;
}

interface BuiltinAssetSource {
  __typename: 'BuiltinAsset';
}

type AssetSource = ERC20AssetSource | BuiltinAssetSource;

export interface Asset {
  __typename: 'Asset';
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: AssetSource;
}

interface DepositManagerProps {
  assets: Asset[];
  isFaucetable: boolean;
}

export const DepositManager = ({
  assets,
  isFaucetable,
}: DepositManagerProps) => {
  const { asset, balance, allowance, deposited, max, update } =
    useDepositStore();
  useDepositBalances(isFaucetable);

  // Set up approve transaction
  const approve = useSubmitApproval();

  // Set up deposit transaction
  const deposit = useSubmitDeposit();

  // Set up faucet transaction
  const faucet = useSubmitFaucet();

  const handleSelectAsset = useCallback(
    (id) => {
      const asset = assets.find((a) => a.id === id);
      if (!asset) return;
      update({ asset });
    },
    [assets, update]
  );

  return (
    <>
      <DepositForm
        balance={balance}
        selectedAsset={asset}
        onSelectAsset={handleSelectAsset}
        assets={sortBy(assets, 'name')}
        submitApprove={() => approve.perform()}
        submitDeposit={(args) => deposit.perform(args)}
        requestFaucet={() => faucet.perform()}
        deposited={deposited}
        max={max}
        allowance={allowance}
        isFaucetable={isFaucetable}
      />
      <approve.Dialog />
      <faucet.Dialog />
      <deposit.Dialog />
    </>
  );
};
