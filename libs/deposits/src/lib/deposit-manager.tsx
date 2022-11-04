import { DepositForm } from './deposit-form';
import { useSubmitDeposit } from './use-submit-deposit';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useDepositStore } from './deposit-store';
import { useCallback, useEffect } from 'react';
import { useDepositBalances } from './use-deposit-balances';
import type { Asset } from '@vegaprotocol/assets';
import type { DepositDialogStylePropsSetter } from './deposit-dialog';
import pick from 'lodash/pick';
import type { EthTransaction } from '@vegaprotocol/web3';
import { EthTxStatus } from '@vegaprotocol/web3';
import { t } from '@vegaprotocol/react-helpers';

interface DepositManagerProps {
  assetId?: string;
  assets: Asset[];
  isFaucetable: boolean;
  setDialogStyleProps?: DepositDialogStylePropsSetter;
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

const getProps = (txContent?: EthTransaction['TxContent']) =>
  txContent ? pick(txContent, ['title', 'icon', 'intent']) : undefined;

export const DepositManager = ({
  assetId,
  assets,
  isFaucetable,
  setDialogStyleProps,
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

  const transactionInProgress = [
    approve.TxContent,
    deposit.TxContent,
    faucet.TxContent,
  ].filter((t) => t.status !== EthTxStatus.Default)[0];

  useEffect(() => {
    setDialogStyleProps?.(getProps(transactionInProgress));
  }, [setDialogStyleProps, transactionInProgress]);

  const returnLabel = t('Return to deposit');

  return (
    <>
      {!transactionInProgress && (
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
      )}

      <approve.TxContent.Content returnLabel={returnLabel} />
      <faucet.TxContent.Content returnLabel={returnLabel} />
      <deposit.TxContent.Content returnLabel={returnLabel} />
    </>
  );
};
