import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { WithdrawForm } from './withdraw-form';
import type { WithdrawalFields } from './use-withdraw';
import { useWithdraw } from './use-withdraw';
import { WithdrawDialog } from './withdraw-dialog';
import {
  isExpectedEthereumError,
  EthTxStatus,
  useTokenDecimals,
} from '@vegaprotocol/web3';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import type { Account, Asset } from './types';
import { useWeb3React } from '@web3-react/core';
import { useGetWithdrawaLimits } from './use-get-withdraw-limits';

export interface WithdrawManagerProps {
  assets: Asset[];
  accounts: Account[];
  initialAssetId?: string;
  isNewContract: boolean;
}

export const WithdrawManager = ({
  assets,
  accounts,
  initialAssetId,
  isNewContract,
}: WithdrawManagerProps) => {
  const dialogDismissed = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);

  const { account: ethereumAccount } = useWeb3React();
  const { ethTx, vegaTx, approval, submit, reset } = useWithdraw(
    dialogDismissed.current,
    isNewContract
  );

  // Find the asset object from the select box
  const asset = useMemo(() => {
    return assets?.find((a) => a.id === assetId);
  }, [assets, assetId]);

  const limits = useGetWithdrawaLimits(asset);

  const max = useMemo(() => {
    if (!asset) {
      return new BigNumber(0);
    }

    const account = accounts.find(
      (a) => a.type === AccountType.General && a.asset.id === asset.id
    );

    if (!account) {
      return new BigNumber(0);
    }

    const v = new BigNumber(addDecimal(account.balance, asset.decimals));
    return BigNumber.minimum(v, limits ? limits.max : new BigNumber(Infinity));
  }, [asset, accounts, limits]);

  const min = useMemo(() => {
    return asset
      ? new BigNumber(addDecimal('1', asset.decimals))
      : new BigNumber(0);
  }, [asset]);

  const handleSubmit = useCallback(
    (args: WithdrawalFields) => {
      reset();
      setDialogOpen(true);
      submit(args);
      dialogDismissed.current = false;
    },
    [submit, reset]
  );

  // Close dialog if error is due to user rejecting the tx
  useEffect(() => {
    if (
      ethTx.status === EthTxStatus.Error &&
      isExpectedEthereumError(ethTx.error)
    ) {
      setDialogOpen(false);
    }
  }, [ethTx.status, ethTx.error]);

  return (
    <>
      <WithdrawForm
        ethereumAccount={ethereumAccount}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        max={max}
        min={min}
        submitWithdraw={handleSubmit}
      />
      <WithdrawDialog
        vegaTx={vegaTx}
        ethTx={ethTx}
        approval={approval}
        dialogOpen={dialogOpen}
        onDialogChange={(isOpen) => {
          setDialogOpen(isOpen);

          if (!isOpen) {
            dialogDismissed.current = true;
          }
        }}
      />
    </>
  );
};
