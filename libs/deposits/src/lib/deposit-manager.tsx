import { DepositForm } from './deposit-form';
import type { DepositFormProps } from './deposit-form';
import { removeDecimal } from '@vegaprotocol/utils';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useSubmitFaucet } from './use-submit-faucet';
import { useEffect, useMemo, useState } from 'react';
import { useBalances } from './use-deposit-balances';
import type { Asset } from '@vegaprotocol/assets';
import {
  useEthTransactionStore,
  useCollateralBridge,
  toAssetData,
} from '@vegaprotocol/web3';

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

  const initialAsset = assets.find((a) => a.id === initialAssetId);

  const [asset, setAsset] = useState(() => {
    return initialAsset;
  });

  const assetData = useMemo(() => toAssetData(asset), [asset]);

  const { contract, config } = useCollateralBridge(assetData?.chainId);

  const { balances } = useBalances(assetData);

  const approve = useSubmitApproval(asset, () => undefined);
  const faucet = useSubmitFaucet(asset, () => undefined);

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

  useEffect(() => {
    // When we change asset, also clear the tracked faucet/approve transactions so
    // we dont render stale UI
    approve.reset();
    faucet.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.id]);

  return (
    <DepositForm
      selectedAsset={asset}
      onDisconnect={() => undefined}
      onSelectAsset={(assetId) => {
        const asset = assets.find((a) => a.id === assetId);
        setAsset(asset);
      }}
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
