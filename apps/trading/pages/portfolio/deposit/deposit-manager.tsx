import type { DepositPage } from './__generated__/DepositPage';
import { useMemo, useState } from 'react';
import type { EthereumConfig } from '../../../components/web3-container/web3-container';
import { DepositForm } from './deposit-form';
import { useBalanceOfERC20Token } from './use-balance-of-erc20-token';
import { useDeposit } from './use-deposit';
import sortBy from 'lodash/sortBy';
import { useApprove } from './use-approve';
import { useDepositLimits } from './use-deposit-limits';
import { useAllowance } from './use-allowance';
import { ApproveDialog } from './approve-dialog';
import { DepositDialog } from './deposit-dialog';

interface DepositManagerProps {
  ethereumConfig: EthereumConfig;
  data: DepositPage;
  initialAssetId?: string;
}

export const DepositManager = ({
  ethereumConfig,
  data,
  initialAssetId,
}: DepositManagerProps) => {
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = data.assets?.find((a) => a.id === assetId);
    return asset;
  }, [data, assetId]);

  // Get users balance of the erc20 token selected
  const balanceOf = useBalanceOfERC20Token(asset);

  // Get temporary deposit limits
  const limits = useDepositLimits(asset);

  // Get allowance (approved spending limit of brdige contract) for the selected asset
  const allowance = useAllowance(
    ethereumConfig.collateral_bridge_contract.address,
    asset
  );

  const {
    perform: performApprove,
    status: statusApprove,
    confirmations: confirmationsApprove,
    txHash: txHashApprove,
    error: errorApprove,
  } = useApprove(ethereumConfig.collateral_bridge_contract.address, asset);

  const {
    perform: performDeposit,
    status: statusDeposit,
    confirmations: confirmationsDeposit,
    txHash: txHashDeposit,
    finalizedDeposit,
    error: errorDeposit,
  } = useDeposit(ethereumConfig.confirmations);

  return (
    <>
      <DepositForm
        available={balanceOf}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(data.assets, 'name')}
        submitApprove={performApprove}
        submitDeposit={performDeposit}
        limits={limits}
        allowance={allowance}
      />
      <ApproveDialog
        status={statusApprove}
        confirmations={confirmationsApprove}
        requiredConfirmations={1}
        txHash={txHashApprove}
        error={errorApprove}
      />
      <DepositDialog
        status={statusDeposit}
        finalizedDeposit={finalizedDeposit}
        txHash={txHashDeposit}
        confirmations={confirmationsDeposit}
        requiredConfirmations={ethereumConfig.confirmations}
        error={errorDeposit}
      />
    </>
  );
};
