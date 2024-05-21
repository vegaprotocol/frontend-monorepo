import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { AccountManager } from '@vegaprotocol/accounts';
import { useDataGridEvents } from '@vegaprotocol/datagrid';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';

export const AccountsContainer = ({
  pinnedAssets,
}: {
  pinnedAssets?: PinnedAsset[];
}) => {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onMarketClick = useMarketClickHandler(true);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
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

  const navigateToAssetAction = (path: string, assetId: string | undefined) => {
    let params = '';
    if (assetId) {
      searchParams.append('assetId', assetId);
      params = `?${searchParams.toString()}`;
    }
    navigate(path + params);
  };

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
      onClickDeposit={(assetId) =>
        navigateToAssetAction(Links.DEPOSIT(), assetId)
      }
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
