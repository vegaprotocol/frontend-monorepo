import { Button } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';

export const EthWalletContainer = ({
  children,
}: {
  children: ReactElement;
}) => {
  const { account } = useWeb3React();
  const { t } = useTranslation();
  const { open } = useWeb3ConnectStore();

  if (!account) {
    return (
      <div className="w-full text-center">
        <Button onClick={() => open()}>{t('connectEthWallet')}</Button>
      </div>
    );
  }
  return children;
};
