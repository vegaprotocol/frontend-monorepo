import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { CreateWithdrawForm } from './create-withdraw-form';
import { useCreateWithdraw } from './use-create-withdraw';
import { useCompleteWithdraw } from './use-complete-withdraw';
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
  const withdrawal = useCreateWithdraw();
  const complete = useCompleteWithdraw();

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  const handleSubmit = useCallback(
    (args) => {
      setDialogOpen(true);
      withdrawal.reset();
      withdrawal.submit(args);
      dialogDismissed.current = false;
    },
    [withdrawal]
  );

  useEffect(() => {
    if (withdrawal.approval && !dialogDismissed.current) {
      complete.perform(withdrawal.approval);
    }
    // eslint-disable-next-line
  }, [withdrawal.approval]);

  // Close dialog if error is due to user rejecting the tx
  useEffect(() => {
    if (
      complete.transaction.status === EthTxStatus.Error &&
      isExpectedEthereumError(complete.transaction.error)
    ) {
      setDialogOpen(false);
    }
  }, [complete.transaction]);

  return (
    <>
      <CreateWithdrawForm
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        submitWithdrawalCreate={handleSubmit}
      />
      <WithdrawDialog
        vegaTx={withdrawal.transaction}
        ethTx={complete.transaction}
        approval={withdrawal.approval}
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
