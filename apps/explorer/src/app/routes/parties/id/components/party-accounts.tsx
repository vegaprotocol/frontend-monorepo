import { AccountManager } from '@vegaprotocol/accounts';
import { useCallback } from 'react';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

interface PartyAccountsProps {
  partyId: string;
}

/**
 * Renders a list of a party's accounts as a table. Currently unsorted, but could
 * probably do with sorting by asset, and then within asset, by type with general
 * appearing first and... tbd
 */
export const PartyAccounts = ({ partyId }: PartyAccountsProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const onClickAsset = useCallback(
    (assetId?: string) => {
      assetId && openAssetDetailsDialog(assetId);
    },
    [openAssetDetailsDialog]
  );

  return (
    <div className="block min-h-44 h-60 4 w-full border-red-800 relative">
      <AccountManager
        partyId={partyId}
        onClickAsset={onClickAsset}
        isReadOnly={true}
      />
    </div>
  );
};
