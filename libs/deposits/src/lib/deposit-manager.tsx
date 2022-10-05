import { DepositForm } from './deposit-form';
import { useSubmitDeposit } from './use-submit-deposit';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useDepositStore } from './deposit-store';
import { useCallback, useEffect } from 'react';
import { useDepositBalances } from './use-deposit-balances';
import type { Asset } from '@vegaprotocol/assets';

interface DepositManagerProps {
  assetId?: string;
  assets: Asset[];
  isFaucetable: boolean;
}

const useDepositAsset = (assets: Asset[], assetId?: string) => {
  const { asset, balance, allowance, deposited, max, update } =
    useDepositStore();

  const handleSelectAsset = useCallback(
    (id: string) => {
      const asset = assets.find((a) => a.id === id);
      update({ asset });
    },
    [assets, update]
  );

  useEffect(() => {
    handleSelectAsset(assetId || '');
  }, [assetId, handleSelectAsset]);

  return { asset, balance, allowance, deposited, max, handleSelectAsset };
};

export const DepositManager = ({
  assetId,
  assets,
  isFaucetable,
}: DepositManagerProps) => {
  const { asset, balance, allowance, deposited, max, handleSelectAsset } =
    useDepositAsset(assets, assetId);

  useDepositBalances(isFaucetable);

  // Set up approve transaction
  const approve = useSubmitApproval();

  // Set up deposit transaction
  const deposit = useSubmitDeposit();

  // Set up faucet transaction
  const faucet = useSubmitFaucet();

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
