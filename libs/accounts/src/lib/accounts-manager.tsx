import { memo } from 'react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { type PinnedAsset } from './accounts-table';
import { AccountTable } from './accounts-table';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';
import { assetsProvider } from '@vegaprotocol/assets';

interface AccountManagerProps {
  partyId?: string;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
  onClickTransfer?: (assetId?: string) => void;
  onClickSwap?: (assetId?: string) => void;
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
    <div className="relative h-full">
      <AccountTable rowData={data} pinnedAssets={pinnedAssets} {...props} />
    </div>
  );
};

export default memo(AccountManager);
