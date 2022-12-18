import { DepositForm } from './deposit-form';
import type { DepositFormProps } from './deposit-form';
import { removeDecimal } from '@vegaprotocol/react-helpers';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useEffect, useState } from 'react';
import { useDepositBalances } from './use-deposit-balances';
import { useDepositDialog } from './deposit-dialog';
import type { Asset } from '@vegaprotocol/assets';
import type { DepositDialogStylePropsSetter } from './deposit-dialog';
import pick from 'lodash/pick';
import type { EthTransaction } from '@vegaprotocol/web3';
import {
  EthTxStatus,
  useEthTransactionStore,
  useBridgeContract,
  useEthereumConfig,
} from '@vegaprotocol/web3';
import { t } from '@vegaprotocol/react-helpers';

interface DepositManagerProps {
  assetId?: string;
  assets: Asset[];
  isFaucetable: boolean;
  setDialogStyleProps?: DepositDialogStylePropsSetter;
}

const getProps = (txContent?: EthTransaction['TxContent']) =>
  txContent ? pick(txContent, ['title', 'icon', 'intent']) : undefined;

export const DepositManager = ({
  assetId: initialAssetId,
  assets,
  isFaucetable,
  setDialogStyleProps,
}: DepositManagerProps) => {
  const createEthTransaction = useEthTransactionStore((state) => state.create);
  const { config } = useEthereumConfig();
  const [assetId, setAssetId] = useState(initialAssetId);
  const asset = assets.find((a) => a.id === assetId);
  const bridgeContract = useBridgeContract();
  const closeDepositDialog = useDepositDialog((state) => state.close);

  const { balance, allowance, deposited, max } = useDepositBalances(
    asset,
    isFaucetable
  );
  console.log({
    balance: balance.toFixed(),
    allowance: allowance.toFixed(),
    deposited: deposited.toFixed(),
    max: max.toFixed(),
    asset,
  });

  // Set up approve transaction
  const approve = useSubmitApproval(asset);

  // Set up faucet transaction
  const faucet = useSubmitFaucet();

  const transactionInProgress = [approve.TxContent, faucet.TxContent].filter(
    (t) => t.status !== EthTxStatus.Default
  )[0];

  useEffect(() => {
    setDialogStyleProps?.(getProps(transactionInProgress));
  }, [setDialogStyleProps, transactionInProgress]);

  const returnLabel = t('Return to deposit');

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
    <>
      {!transactionInProgress && (
        <DepositForm
          balance={balance}
          selectedAsset={asset}
          onSelectAsset={setAssetId}
          assets={sortBy(assets, 'name')}
          submitApprove={() => approve.perform()}
          submitDeposit={submitDeposit}
          requestFaucet={() => faucet.perform()}
          deposited={deposited}
          max={max}
          allowance={allowance}
          isFaucetable={isFaucetable}
        />
      )}

      <approve.TxContent.Content returnLabel={returnLabel} />
      <faucet.TxContent.Content returnLabel={returnLabel} />
    </>
  );
};
