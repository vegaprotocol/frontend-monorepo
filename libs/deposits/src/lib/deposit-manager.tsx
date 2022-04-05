import type { DepositEvent_busEvents_event_Deposit } from './__generated__/DepositEvent';
import { useEffect, useMemo, useState } from 'react';
import { DepositForm } from './deposit-form';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { useSubmitDeposit } from './use-submit-deposit';
import sortBy from 'lodash/sortBy';
import { useSubmitApproval } from './use-submit-approval';
import { useGetDepositLimits } from './use-get-deposit-limits';
import { useGetAllowance } from './use-get-allowance';
import { TransactionDialog } from '@vegaprotocol/ui-toolkit';
import { useSubmitFaucet } from './use-submit-faucet';
import {
  useTokenContract,
  useBridgeContract,
} from '@vegaprotocol/react-helpers';

export interface Asset {
  __typename: 'Asset';
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: {
    __typename: 'ERC20';
    contractAddress: string;
  };
}

interface DepositManagerProps {
  requiredConfirmations: number;
  bridgeAddress: string;
  assets: Asset[];
  initialAssetId?: string;
}

export const DepositManager = ({
  requiredConfirmations,
  bridgeAddress,
  assets,
  initialAssetId,
}: DepositManagerProps) => {
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  const tokenContract = useTokenContract(
    asset?.source.contractAddress,
    process.env['NX_VEGA_ENV'] !== 'MAINNET'
  );
  const bridgeContract = useBridgeContract();

  // Get users balance of the erc20 token selected
  const { balanceOf, refetch } = useGetBalanceOfERC20Token(tokenContract);

  // Get temporary deposit limits
  const limits = useGetDepositLimits(bridgeContract, asset);

  // Get allowance (approved spending limit of brdige contract) for the selected asset
  const allowance = useGetAllowance(tokenContract, bridgeAddress);

  // Set up approve transaction
  const approve = useSubmitApproval(tokenContract, bridgeAddress);

  // Set up deposit transaction
  const deposit = useSubmitDeposit(bridgeContract, requiredConfirmations);

  // Set up faucet transaction
  const faucet = useSubmitFaucet(tokenContract);

  // Update balance after confirmation event has been received
  useEffect(() => {
    if (deposit.confirmationEvent !== null) {
      refetch();
    }
  }, [deposit.confirmationEvent, refetch]);

  return (
    <>
      <DepositForm
        available={balanceOf}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        submitApprove={approve.perform}
        submitDeposit={deposit.perform}
        requestFaucet={faucet.perform}
        limits={limits}
        allowance={allowance}
      />
      <TransactionDialog {...approve} name="approve" />
      <TransactionDialog {...faucet} name="faucet" />
      <TransactionDialog<DepositEvent_busEvents_event_Deposit>
        {...deposit}
        name="deposit"
        // Must wait for additional confirmations for Vega to pick up the Ethereum transaction
        requiredConfirmations={requiredConfirmations}
      />
    </>
  );
};
