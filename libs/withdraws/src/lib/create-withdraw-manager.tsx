import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { CreateWithdrawForm } from './create-withdraw-form';
import { useCreateWithdraw } from './use-create-withdraw';
import { useCompleteWithdraw } from './use-complete-withdraw';
import { WithdrawDialog } from './withdraw-dialog';

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
  const ethereumTxRequested = useRef(false);
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);
  const {
    submit,
    approval,
    transaction: vegaTransaction,
  } = useCreateWithdraw();
  const transaction = useCompleteWithdraw();

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  const handleSubmit = useCallback(
    (args) => {
      ethereumTxRequested.current = false;
      submit(args);
    },
    [submit]
  );

  useEffect(() => {
    if (approval && !ethereumTxRequested.current) {
      transaction.perform(approval);
      ethereumTxRequested.current = true;
    }
    // eslint-disable-next-line
  }, [approval]);

  return (
    <>
      <CreateWithdrawForm
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(assets, 'name')}
        submitWithdrawalCreate={handleSubmit}
      />
      <WithdrawDialog
        vegaTx={vegaTransaction}
        ethTx={transaction}
        approval={approval}
      />
    </>
  );
};
