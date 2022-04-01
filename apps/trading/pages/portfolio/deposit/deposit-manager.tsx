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
import { TransactionDialog } from './transaction-dialog';
import { useFaucet } from './use-faucet';

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

  const assetContractAddress = useMemo(() => {
    return asset && asset.source.__typename === 'ERC20'
      ? asset.source.contractAddress
      : undefined;
  }, [asset]);

  // Get users balance of the erc20 token selected
  const balanceOf = useBalanceOfERC20Token(assetContractAddress);

  // Get temporary deposit limits
  const limits = useDepositLimits(asset);

  // Get allowance (approved spending limit of brdige contract) for the selected asset
  const allowance = useAllowance(
    ethereumConfig.collateral_bridge_contract.address,
    assetContractAddress
  );

  const approve = useApprove(
    ethereumConfig.collateral_bridge_contract.address,
    assetContractAddress
  );

  const deposit = useDeposit(ethereumConfig.confirmations);

  const faucet = useFaucet(assetContractAddress);

  return (
    <>
      <DepositForm
        available={balanceOf}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(data.assets, 'name')}
        submitApprove={approve.perform}
        submitDeposit={deposit.perform}
        requestFaucet={faucet.perform}
        limits={limits}
        allowance={allowance}
      />
      <TransactionDialog
        {...approve}
        name="approve"
        requiredConfirmations={1}
      />
      <TransactionDialog {...faucet} name="faucet" requiredConfirmations={1} />
      <TransactionDialog
        {...deposit}
        name="deposit"
        requiredConfirmations={ethereumConfig.confirmations}
      />
    </>
  );
};
