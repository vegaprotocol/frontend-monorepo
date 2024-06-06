import { DepositForm } from './deposit-form';
import type { DepositFormProps } from './deposit-form';
import { removeDecimal } from '@vegaprotocol/utils';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useCallback, useEffect } from 'react';
import { useBalances } from './use-deposit-balances';
import type { Asset } from '@vegaprotocol/assets';
import {
  useEthTransactionStore,
  useCollateralBridge,
  toAssetData,
} from '@vegaprotocol/web3';
import { usePersistentDeposit } from './use-persistent-deposit';
import { useWeb3React } from '@web3-react/core';

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

  const [persistentDeposit, savePersistentDeposit] =
    usePersistentDeposit(initialAssetId);
  const assetId = persistentDeposit?.assetId;
  const asset = assets.find((a) => a.id === assetId);

  const assetData = toAssetData(asset);
  const { contract, config } = useCollateralBridge(assetData?.chainId);
  const { balances, getBalances, reset } = useBalances();

  const { chainId } = useWeb3React();
  useEffect(() => {
    // gets balances on load and re-trigger balances when chain changed
    if (assetData?.chainId !== chainId) {
      reset();
    }
    if (assetData && !balances) {
      getBalances(assetData);
    }
  }, [assetData, getBalances, chainId, balances, reset]);

  const approve = useSubmitApproval(asset, () => getBalances(assetData));
  const faucet = useSubmitFaucet(asset, () => getBalances(assetData));

  const submitDeposit = (
    args: Parameters<DepositFormProps['submitDeposit']>['0']
  ) => {
    if (!asset || !contract) {
      return;
    }
    createEthTransaction(
      contract,
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
  };

  const onAmountChange = useCallback(
    (amount: string) => {
      persistentDeposit &&
        savePersistentDeposit({ ...persistentDeposit, amount });
    },
    [savePersistentDeposit, persistentDeposit]
  );

  useEffect(() => {
    // When we change asset, also clear the tracked faucet/approve transactions so
    // we dont render stale UI
    approve.reset();
    faucet.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  return (
    <DepositForm
      selectedAsset={asset}
      onDisconnect={reset}
      onSelectAsset={(assetId) => {
        const selected = toAssetData(assets.find((a) => a.id === assetId));
        if (selected) {
          savePersistentDeposit({ assetId: selected.id });
          getBalances(selected);
        }
      }}
      handleAmountChange={onAmountChange}
      assets={sortBy(assets, 'name')}
      submitApprove={approve.perform}
      submitDeposit={submitDeposit}
      submitFaucet={faucet.perform}
      faucetTxId={faucet.id}
      approveTxId={approve.id}
      balances={balances}
      isFaucetable={isFaucetable}
    />
  );
};
