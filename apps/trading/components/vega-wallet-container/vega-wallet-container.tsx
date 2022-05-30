import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useGlobalStore } from '../../stores';

interface VegaWalletContainerProps {
  children: ReactNode;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const store = useGlobalStore();
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <div className="text-center">
          <p className="mb-12">{t('Connect your Vega wallet')}</p>
          <Button
            onClick={() => store.setVegaWalletConnectDialog(true)}
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
