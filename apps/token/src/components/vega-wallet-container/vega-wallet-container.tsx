import { Button } from '@vegaprotocol/ui-toolkit';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

interface VegaWalletContainerProps {
  children: (key: VegaKeyExtended) => React.ReactElement;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const { t } = useTranslation();
  const { keypair } = useVegaWallet();
  const { appDispatch } = useAppState();

  if (!keypair) {
    return (
      <p>
        <Button
          className="fill"
          onClick={() =>
            appDispatch({
              type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
              isOpen: true,
            })
          }
        >
          {t('connectVegaWallet')}
        </Button>
      </p>
    );
  }

  return children(keypair);
};
