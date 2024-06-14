import { useCallback } from 'react';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { AccountManager } from '@vegaprotocol/accounts';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDataGridEvents } from '@vegaprotocol/datagrid';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { ViewType, useSidebar } from '../sidebar';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const AccountsContainer = ({
  pinnedAssets,
}: {
  pinnedAssets?: PinnedAsset[];
}) => {
  const t = useT();
  const onMarketClick = useMarketClickHandler(true);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);

  const gridStore = useAccountStore((store) => store.gridStore);
  const updateGridStore = useAccountStore((store) => store.updateGridStore);
  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    updateGridStore(colState);
  });

  const onClickAsset = useCallback(
    (assetId?: string) => {
      assetId && openAssetDetailsDialog(assetId);
    },
    [openAssetDetailsDialog]
  );

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return (
    <AccountManager
      partyId={pubKey}
      onClickAsset={onClickAsset}
      onClickDeposit={() => {
        setViews({ type: ViewType.Deposit }, currentRouteId);
      }}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      pinnedAssets={pinnedAssets}
      gridProps={gridStoreCallbacks}
    />
  );
};

export const useAccountStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_accounts_store',
  })
);
