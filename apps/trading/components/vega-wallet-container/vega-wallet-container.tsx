import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useGlobalStore } from '../../stores';

interface VegaWalletContainerProps {
  children: ReactNode;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <div className="text-center">
          <p className="mb-4" data-testid="connect-vega-wallet-text">
            {t('Connect your Vega wallet')}
          </p>
          <Button
            onClick={() => update({ connectDialog: true })}
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
