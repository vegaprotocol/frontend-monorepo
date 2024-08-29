import { t } from 'i18next';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';

export const WalletNotConnectedAlert = () => (
  <Notification
    title={t('AMM_WALLET_ALERT_NOT_CONNECTED')}
    intent={Intent.Warning}
    message={
      <>
        <p className="mb-2">
          {t('AMM_WALLET_ALERT_NOT_CONNECTED_DESCRIPTION')}
        </p>
        <VegaWalletConnectButton />
      </>
    }
  />
);
