import { useEffect, useMemo, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { CreateWithdrawForm } from './create-withdraw-form';
import { useCreateWithdraw } from './use-create-withdraw';
import { CreateWithdrawDialog } from './create-withdraw-dialog';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { VegaTxStatus } from '@vegaprotocol/wallet';

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
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { submit, approval, transaction, reset } = useCreateWithdraw();

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  useEffect(() => {
    if (transaction.status !== VegaTxStatus.Default) {
      setDialogOpen(true);
    }
  }, [transaction.status]);

  const getDialogIntent = (status: VegaTxStatus) => {
    if (approval) {
      return Intent.Success;
    }

    if (status === VegaTxStatus.Rejected) {
      return Intent.Danger;
    }

    return Intent.Progress;
  };

  return (
    <>
      <CreateWithdrawForm
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        submitWithdrawalCreate={submit}
      />
      <Dialog
        open={dialogOpen}
        onChange={(isOpen) => {
          setDialogOpen(isOpen);

          // If closing reset
          if (!isOpen) {
            reset();
          }
        }}
        intent={getDialogIntent(transaction.status)}
      >
        <CreateWithdrawDialog
          transaction={transaction}
          finalizedApproval={approval}
        />
      </Dialog>
    </>
  );
};
