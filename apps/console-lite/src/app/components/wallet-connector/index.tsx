import { useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import * as React from 'react';

const ConnectWallet = () => {
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  return (
    <section
      className="p-8 bg-white-normal dark:bg-offBlack"
      data-testid="trading-connect-wallet"
    >
      <h3 className="mb-4 text-2xl text-offBlack dark:text-white">
        {t('Please connect your Vega wallet to make a trade')}
      </h3>
      <div className="mb-4">
        <Button variant="primary" onClick={openVegaWalletDialog} size="lg">
          {t('Connect Vega wallet')}
        </Button>
      </div>
      <h4 className="text-lg text-offBlack dark:text-white">
        {t("Don't have a wallet?")}
      </h4>
      <p>
        {t('Head over to ')}
        <a className="text-blue" href="https://vega.xyz/wallet">
          https://vega.xyz/wallet
        </a>
        {t(' and follow the steps to create one.')}
      </p>
    </section>
  );
};

export default ConnectWallet;
