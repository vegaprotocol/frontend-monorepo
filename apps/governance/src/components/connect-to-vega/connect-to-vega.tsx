import { Button } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { useDialogStore } from '@vegaprotocol/wallet-react';

export const ConnectToVega = () => {
  const { t } = useTranslation();
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  return (
    <Button
      onClick={openVegaWalletDialog}
      data-testid="connect-to-vega-wallet-btn"
      variant="primary"
    >
      {t('connectVegaWallet')}
    </Button>
  );
};
