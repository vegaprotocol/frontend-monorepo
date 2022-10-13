import { Button } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

export const ConnectToVega = () => {
  const { appDispatch } = useAppState();
  const { t } = useTranslation();
  const { updateDialogOpen } = useVegaWalletDialogStore((store) => ({
    updateDialogOpen: store.updateDialogOpen,
  }));
  return (
    <Button
      onClick={() => {
        appDispatch({
          type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
          isOpen: true,
        });
        updateDialogOpen(true);
      }}
      data-testid="connect-to-vega-wallet-btn"
    >
      {t('connectVegaWallet')}
    </Button>
  );
};
