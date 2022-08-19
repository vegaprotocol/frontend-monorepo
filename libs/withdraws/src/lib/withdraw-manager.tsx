import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { WithdrawForm } from './withdraw-form';
import type { WithdrawalFields } from './use-withdraw';
import { useWithdraw } from './use-withdraw';
import { WithdrawDialog } from './withdraw-dialog';
import { isExpectedEthereumError, EthTxStatus } from '@vegaprotocol/web3';
import type { Asset } from '@vegaprotocol/react-helpers';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import type { Account } from './types';
import { useGetWithdrawLimits } from './use-get-withdraw-limits';

export interface WithdrawManagerProps {
  assets: Asset[];
  accounts: Account[];
  initialAssetId?: string;
}

export const WithdrawManager = ({
  assets,
  accounts,
  initialAssetId,
}: WithdrawManagerProps) => {
  const dialogDismissed = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);

  const { ethTx, vegaTx, approval, submit, reset } = useWithdraw(
    dialogDismissed.current
  );

  // Find the asset object from the select box
  const asset = useMemo(() => {
    return assets?.find((a) => a.id === assetId);
  }, [assets, assetId]);

  const account = useMemo(() => {
    return accounts.find(
      (a) => a.type === AccountType.General && a.asset.id === asset?.id
    );
  }, [asset, accounts]);

  const limits = useGetWithdrawLimits(asset);

  const max = useMemo(() => {
    if (!asset) {
      return {
        balance: new BigNumber(0),
        threshold: new BigNumber(0),
      };
    }

    const balance = account
      ? new BigNumber(addDecimal(account.balance, asset.decimals))
      : new BigNumber(0);

    return {
      balance,
      threshold: limits ? limits.max : new BigNumber(Infinity),
    };
  }, [asset, account, limits]);

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
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        max={max}
        min={min}
        submitWithdraw={handleSubmit}
        limits={limits}
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
