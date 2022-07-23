import { useEffect, useMemo, useState } from 'react';
import { DepositForm } from './deposit-form';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useSubmitDeposit } from './use-submit-deposit';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useGetDepositLimits } from './use-get-deposit-limits';
import { useGetAllowance } from './use-get-allowance';
import { useSubmitFaucet } from './use-submit-faucet';
import { EthTxStatus, useEthereumConfig } from '@vegaprotocol/web3';
import { useTokenContract } from '@vegaprotocol/web3';
import { removeDecimal } from '@vegaprotocol/react-helpers';

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
  initialAssetId?: string;
  isFaucetable?: boolean;
}

export const DepositManager = ({
  assets,
  initialAssetId,
  isFaucetable,
}: DepositManagerProps) => {
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  const { config } = useEthereumConfig();

  const tokenContract = useTokenContract(
    asset?.source.__typename === 'ERC20'
      ? asset.source.contractAddress
      : undefined,
    isFaucetable
  );

  // Get users balance of the erc20 token selected
  const { balance, refetch: refetchBalance } = useGetBalanceOfERC20Token(
    tokenContract,
    asset?.decimals
  );

  // Get temporary deposit limits
  const limits = useGetDepositLimits(asset);

  // Get allowance (approved spending limit of brdige contract) for the selected asset
  const { allowance, refetch: refetchAllowance } = useGetAllowance(
    tokenContract,
    asset?.decimals
  );

  // Set up approve transaction
  const approve = useSubmitApproval(tokenContract);

  // Set up deposit transaction
  const deposit = useSubmitDeposit();

  // Set up faucet transaction
  const faucet = useSubmitFaucet(tokenContract);

  // Update balance after confirmation event has been received
  useEffect(() => {
    if (
      faucet.transaction.status === EthTxStatus.Confirmed ||
      deposit.transaction.status === EthTxStatus.Confirmed
    ) {
      refetchBalance();
    }
  }, [deposit.transaction.status, faucet.transaction.status, refetchBalance]);

  // After an approval transaction refetch allowance
  useEffect(() => {
    if (approve.transaction.status === EthTxStatus.Confirmed) {
      refetchAllowance();
    }
  }, [approve.transaction.status, refetchAllowance]);

  return (
    <>
      <DepositForm
        balance={balance}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        submitApprove={() => {
          if (!asset || !config) return;
          const amount = removeDecimal('1000000', asset.decimals);
          approve.perform(config.collateral_bridge_contract.address, amount);
        }}
        submitDeposit={(args) => {
          deposit.perform(args.assetSource, args.amount, args.vegaPublicKey);
        }}
        requestFaucet={() => faucet.perform()}
        limits={limits}
        allowance={allowance}
        isFaucetable={isFaucetable}
      />
      {approve.dialog}
      {faucet.dialog}
      {deposit.dialog}
    </>
  );
};
