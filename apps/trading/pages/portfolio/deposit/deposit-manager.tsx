import type { DepositPage } from './__generated__/DepositPage';
import type { DepositEvent_busEvents_event_Deposit } from './__generated__/DepositEvent';
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
import { useTokenContract } from '../../../hooks/use-token-contract';
import { useBridgeContract } from '../../../hooks/use-bridge-contract';

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

  const tokenContract = useTokenContract(
    asset && asset.source.__typename === 'ERC20'
      ? asset.source.contractAddress
      : undefined
  );
  const bridgeContract = useBridgeContract();

  // Get users balance of the erc20 token selected
  const balanceOf = useBalanceOfERC20Token(tokenContract);

  // Get temporary deposit limits
  const limits = useDepositLimits(bridgeContract, asset);

  // Get allowance (approved spending limit of brdige contract) for the selected asset
  const allowance = useAllowance(
    tokenContract,
    ethereumConfig.collateral_bridge_contract.address
  );

  const approve = useApprove(
    tokenContract,
    ethereumConfig.collateral_bridge_contract.address
  );

  const deposit = useDeposit(bridgeContract, ethereumConfig.confirmations);

  const faucet = useFaucet(tokenContract);

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
      <TransactionDialog<DepositEvent_busEvents_event_Deposit>
        {...deposit}
        name="deposit"
        requiredConfirmations={ethereumConfig.confirmations}
      />
    </>
  );
};
