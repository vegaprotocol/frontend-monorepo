import { useCallback } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
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
  hideButtons,
  onMarketClick,
}: {
  pinnedAsset?: PinnedAsset;
  hideButtons?: boolean;
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
    <div className="h-full relative">
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
      {!isReadOnly && !hideButtons && (
        <div className="flex gap-2 justify-end p-2 absolute bottom-0 right-0 dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            data-testid="open-transfer"
            onClick={() => setView({ type: ViewType.Transfer })}
          >
            {t('Transfer')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setView({ type: ViewType.Deposit })}
          >
            {t('Deposit')}
          </Button>
        </div>
      )}
    </div>
  );
};

const useAccountStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_accounts_store',
  })
);
