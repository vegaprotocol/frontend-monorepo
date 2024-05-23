import { memo } from 'react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { type PinnedAsset } from './accounts-list';
import { AccountsList } from './accounts-list';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';
import { assetsProvider } from '@vegaprotocol/assets';

export interface AssetActions {
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId: string) => void;
  onClickDeposit?: (assetId: string) => void;
  onClickSwap?: (assetId: string) => void;
  onClickTransfer?: (assetId: string) => void;
}

interface AccountManagerProps extends AssetActions {
  partyId?: string;
  isReadOnly: boolean;
  pinnedAssets?: PinnedAsset[];
  gridProps?: ReturnType<typeof useDataGridEvents>;
}

export const AccountManager = ({
  pinnedAssets,
  ...props
}: AccountManagerProps) => {
  const { data } = useDataProvider({
    dataProvider: assetsProvider,
    variables: undefined,
  });

  return (
    <div className="relative h-full" data-testid="accounts-list">
      <AccountsList rowData={data} pinnedAssets={pinnedAssets} {...props} />
    </div>
  );
};

export default memo(AccountManager);
