import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useDialogStore } from '@vegaprotocol/wallet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VegaWalletContainerProps {
  children: (key: string) => React.ReactElement;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));

  if (!pubKey) {
    return (
      <Button
        data-testid="connect-to-vega-wallet-btn"
        onClick={() => {
          openVegaWalletDialog();
        }}
      >
        {t('connectVegaWallet')}
      </Button>
    );
  }

  return children(pubKey);
};
