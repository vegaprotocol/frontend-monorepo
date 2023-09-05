import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

interface VegaWalletContainerProps {
  children: (key: string) => React.ReactElement;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { appDispatch } = useAppState();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));

  if (!pubKey) {
    return (
      <Button
        data-testid="connect-to-vega-wallet-btn"
        onClick={() => {
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
            isOpen: true,
          });
          openVegaWalletDialog();
        }}
      >
        {t('connectVegaWallet')}
      </Button>
    );
  }

  return children(pubKey);
};
