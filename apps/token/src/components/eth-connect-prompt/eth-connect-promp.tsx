import { Button } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

interface EthConnectPrompProps {
  children?: React.ReactNode;
}

export const EthConnectPrompt = ({ children }: EthConnectPrompProps) => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  return (
    <>
      {children}
      <Button
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
            isOpen: true,
          })
        }
        data-testid="connect-to-eth-btn"
      >
        {t('connectEthWallet')}
      </Button>
    </>
  );
};
