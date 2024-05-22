import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { AccountCard } from './account-card';
import type { AssetActions } from './accounts-manager';
import sortBy from 'lodash/sortBy';

export type PinnedAsset = string;

export interface AccountsListProps extends AssetActions {
  rowData?: AssetFieldsFragment[] | null;
  isReadOnly: boolean;
  pinnedAssets?: PinnedAsset[];
}

export const AccountsList = ({
  rowData,
  pinnedAssets,
  ...props
}: AccountsListProps) => {
  return (
    rowData &&
    (pinnedAssets && pinnedAssets.length
      ? sortBy(rowData, (asset) => {
          if (pinnedAssets.includes(asset.id)) return -1;
          return 1;
        })
      : rowData
    ).map((asset) => {
      return (
        <AccountCard
          asset={asset}
          key={asset.id}
          {...props}
          expanded={pinnedAssets?.includes(asset.id)}
        />
      );
    })
  );
};
