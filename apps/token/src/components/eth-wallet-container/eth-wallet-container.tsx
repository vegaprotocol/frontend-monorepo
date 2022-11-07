import { Button } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';

export const EthWalletContainer = ({
  children,
}: {
  children: ReactElement;
}) => {
  const { account } = useWeb3React();
  const { t } = useTranslation();
  const { appDispatch } = useAppState();

  if (!account) {
    return (
      <div className="w-full text-center">
        <Button
          onClick={() =>
            appDispatch({
              type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
              isOpen: true,
            })
          }
        >
          {t('connectEthWallet')}
        </Button>
      </div>
    );
  }
  return children;
};
