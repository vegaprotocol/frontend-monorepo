import { Button } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

export const ConnectToVega = () => {
  const { appDispatch } = useAppState();
  const { t } = useTranslation();
  return (
    <Button
      onClick={() =>
        appDispatch({
          type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
          isOpen: true,
        })
      }
      className="w-full py-12 h-auto text-h5"
      data-test-id="connect-to-vega-wallet-btn"
    >
      {t('connectVegaWallet')}
    </Button>
  );
};
