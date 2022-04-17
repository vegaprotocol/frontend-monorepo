import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { WithdrawForm } from './withdraw-form';
import { useWithdraw } from './use-withdraw';
import { WithdrawDialog } from './withdraw-dialog';
import {
  isExpectedEthereumError,
  EthTxStatus,
} from '@vegaprotocol/react-helpers';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: {
    contractAddress: string;
  };
}

interface CreateWithdrawManagerProps {
  assets: Asset[];
  initialAssetId?: string;
}

export const CreateWithdrawManager = ({
  assets,
  initialAssetId,
}: CreateWithdrawManagerProps) => {
  const dialogDismissed = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);
  const { ethTx, vegaTx, approval, submit, reset } = useWithdraw(
    dialogDismissed.current
  );

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  const handleSubmit = useCallback(
    (args) => {
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
        submitWithdrawalCreate={handleSubmit}
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
