import { Button } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

export const EthConnectPrompt = () => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  return (
    <Button
      variant="default"
      onClick={() =>
        appDispatch({
          type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
          isOpen: true,
        })
      }
      fill={true}
      data-testid="connect-to-eth-btn"
    >
      {t('connectEthWallet')}
    </Button>
  );
};
