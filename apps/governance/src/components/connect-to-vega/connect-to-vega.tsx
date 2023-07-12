import { Button } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVegaWalletDialogStore } from '@vegaprotocol/wallet';

export const ConnectToVega = () => {
  const { t } = useTranslation();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  return (
    <Button
      onClick={() => {
        openVegaWalletDialog();
      }}
      data-testid="connect-to-vega-wallet-btn"
      variant="primary"
    >
      {t('connectVegaWallet')}
    </Button>
  );
};
