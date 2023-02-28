import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

interface VegaWalletContainerProps {
  children: ReactNode;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const { pubKey } = useVegaWallet();

  if (!pubKey) {
    return (
      <Splash>
        <div className="text-center">
          <p className="mb-4" data-testid="connect-vega-wallet-text">
            {t('Connect your Vega wallet')}
          </p>
          <Button
            onClick={openVegaWalletDialog}
            data-testid="vega-wallet-connect"
          >
            {t('Connect')}
          </Button>
        </div>
      </Splash>
    );
  }

  return <>{children}</>;
};
