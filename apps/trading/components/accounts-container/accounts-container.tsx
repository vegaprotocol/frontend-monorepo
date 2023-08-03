import { useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { AccountManager } from '@vegaprotocol/accounts';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDataGridEvents } from '@vegaprotocol/datagrid';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { ViewType, useSidebar } from '../sidebar';

export const AccountsContainer = ({
  pinnedAsset,
  onMarketClick,
}: {
  pinnedAsset?: PinnedAsset;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const setView = useSidebar((store) => store.setView);

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
      onClickWithdraw={(assetId) => {
        setView({ type: ViewType.Withdraw, assetId });
      }}
      onClickDeposit={(assetId) => {
        setView({ type: ViewType.Deposit, assetId });
      }}
      onClickTransfer={(assetId) => {
        setView({ type: ViewType.Transfer, assetId });
      }}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      pinnedAsset={pinnedAsset}
      gridProps={gridStoreCallbacks}
    />
  );
};

const useAccountStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_accounts_store',
  })
);
