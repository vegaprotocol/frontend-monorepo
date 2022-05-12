import './eth-wallet-container.scss';

import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { Ethereum } from '../icons';
import { Button } from '@vegaprotocol/ui-toolkit';

interface EthWalletContainerProps {
  children: (address: string) => React.ReactElement;
}

export const EthWalletContainer = ({ children }: EthWalletContainerProps) => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  const { account } = useWeb3React();

  if (!account) {
    return (
      <Button
        className="eth-wallet-container"
        data-testid="connect-to-eth-btn"
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
            isOpen: true,
          })
        }
      >
        <div>{t('connectEthWallet')}</div>
        <Ethereum />
      </Button>
    );
  }

  return children(account);
};
