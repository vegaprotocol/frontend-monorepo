import { t } from 'i18next';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { VegaConnectButton } from './navigation';

export const WalletNotConnectedAlert = () => (
  <Alert variant="destructive">
    <AlertTitle>{t('WALLET_ALERT_NOT_CONNECTED')}</AlertTitle>
    <AlertDescription>
      <p className="mb-2">{t('WALLET_ALERT_NOT_CONNECTED_DESCRIPTION')}</p>
      <VegaConnectButton />
    </AlertDescription>
  </Alert>
);
