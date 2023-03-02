import { DepositForm } from './deposit-form';
import type { DepositFormProps } from './deposit-form';
import { removeDecimal } from '@vegaprotocol/utils';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useEffect, useState } from 'react';
import { useDepositBalances } from './use-deposit-balances';
import { useDepositDialog } from './deposit-dialog';
import type { Asset } from '@vegaprotocol/assets';
import pick from 'lodash/pick';
import type { EthTransaction } from '@vegaprotocol/web3';
import {
  EthTxStatus,
  useEthTransactionStore,
  useBridgeContract,
  useEthereumConfig,
} from '@vegaprotocol/web3';
import { t } from '@vegaprotocol/i18n';

interface DepositManagerProps {
  assetId?: string;
  assets: Asset[];
  isFaucetable: boolean;
}

export const DepositManager = ({
  assetId: initialAssetId,
  assets,
  isFaucetable,
}: DepositManagerProps) => {
  const createEthTransaction = useEthTransactionStore((state) => state.create);
  const { config } = useEthereumConfig();
  const [assetId, setAssetId] = useState(initialAssetId);
  const asset = assets.find((a) => a.id === assetId);
  const bridgeContract = useBridgeContract();
  const closeDepositDialog = useDepositDialog((state) => state.close);

  const { balance, allowance, deposited, max, refresh } = useDepositBalances(
    asset,
    isFaucetable
  );

  // Set up approve transaction
  const approve = useSubmitApproval(asset);

  // Set up faucet transaction
  const faucet = useSubmitFaucet(asset);

  const submitDeposit = (
    args: Parameters<DepositFormProps['submitDeposit']>['0']
  ) => {
    if (!asset) {
      return;
    }
    createEthTransaction(
      bridgeContract,
      'deposit_asset',
      [
        args.assetSource,
        removeDecimal(args.amount, asset.decimals),
        prepend0x(args.vegaPublicKey),
      ],
      asset.id,
      config?.confirmations ?? 1,
      true
    );
    closeDepositDialog();
  };

  return (
    <DepositForm
      balance={balance}
      selectedAsset={asset}
      onSelectAsset={(id) => {
        setAssetId(id);
        faucet.reset();
        approve.reset();
      }}
      assets={sortBy(assets, 'name')}
      submitApprove={async () => {
        await approve.perform();
        refresh();
      }}
      approveTx={approve.transaction}
      submitDeposit={submitDeposit}
      requestFaucet={async () => {
        await faucet.perform();
        refresh();
      }}
      faucetTx={faucet.transaction}
      deposited={deposited}
      max={max}
      allowance={allowance}
      isFaucetable={isFaucetable}
    />
  );
};
