import { useMemo, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { CreateWithdrawForm } from './create-withdraw-form';

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

  // Find the asset object from the select box
  const asset = useMemo(() => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset;
  }, [assets, assetId]);

  return (
    <CreateWithdrawForm
      selectedAsset={asset}
      onSelectAsset={(id) => setAssetId(id)}
      assets={sortBy(assets, 'name')}
    />
  );
};
