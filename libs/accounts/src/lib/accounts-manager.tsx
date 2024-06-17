import { memo } from 'react';
import sortBy from 'lodash/sortBy';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';
import { assetsProvider } from '@vegaprotocol/assets';
import { AccountCard, type AssetActions } from './account-card';

interface AccountManagerProps extends AssetActions {
  partyId?: string;
  isReadOnly: boolean;
  pinnedAssets?: string[];
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

  const rows =
    pinnedAssets && pinnedAssets.length
      ? sortBy(data, (asset) => {
          if (pinnedAssets.includes(asset.id)) return -1;
          return 1;
        })
      : data;

  return (
    <div className="relative h-full" data-testid="accounts-list">
      {(rows || []).map((asset) => {
        return (
          <AccountCard
            asset={asset}
            key={asset.id}
            {...props}
            expanded={pinnedAssets?.includes(asset.id)}
          />
        );
      })}
    </div>
  );
};

export default memo(AccountManager);
