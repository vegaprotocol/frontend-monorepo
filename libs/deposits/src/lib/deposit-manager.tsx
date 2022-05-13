import { useEffect, useMemo, useState } from 'react';
import { DepositForm } from './deposit-form';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useSubmitDeposit } from './use-submit-deposit';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useGetDepositLimits } from './use-get-deposit-limits';
import { useGetAllowance } from './use-get-allowance';
import { useSubmitFaucet } from './use-submit-faucet';
import {
  EthTxStatus,
  TransactionDialog,
  useEthereumConfig,
  useTokenDecimals,
} from '@vegaprotocol/web3';
import { useTokenContract } from '@vegaprotocol/web3';

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

  const decimals = useTokenDecimals(tokenContract);

  // Get users balance of the erc20 token selected
  const { balance, refetch } = useGetBalanceOfERC20Token(
    tokenContract,
    decimals
  );

  // Get temporary deposit limits
  const limits = useGetDepositLimits(asset, decimals);

  // Get allowance (approved spending limit of brdige contract) for the selected asset
  const allowance = useGetAllowance(tokenContract, decimals);

  // Set up approve transaction
  const approve = useSubmitApproval(tokenContract);

  // Set up deposit transaction
  const { confirmationEvent, ...deposit } = useSubmitDeposit();

  // Set up faucet transaction
  const faucet = useSubmitFaucet(tokenContract);

  // Update balance after confirmation event has been received
  useEffect(() => {
    if (
      faucet.transaction.status === EthTxStatus.Complete ||
      confirmationEvent !== null
    ) {
      refetch();
    }
  }, [confirmationEvent, refetch, faucet.transaction.status]);

  return (
    <>
      <DepositForm
        available={balance}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        submitApprove={approve.perform}
        submitDeposit={deposit.perform}
        requestFaucet={faucet.perform}
        limits={limits}
        allowance={allowance}
        isFaucetable={isFaucetable}
      />
      <TransactionDialog
        {...approve.transaction}
        name="approve"
        etherscanUrl={etherscanUrl}
      />
      <TransactionDialog
        {...faucet.transaction}
        name="faucet"
        etherscanUrl={etherscanUrl}
      />
      <TransactionDialog
        {...deposit}
        name="deposit"
        confirmed={Boolean(confirmationEvent)}
        // Must wait for additional confirmations for Vega to pick up the Ethereum transaction
        requiredConfirmations={config?.confirmations}
      />
    </>
  );
};
