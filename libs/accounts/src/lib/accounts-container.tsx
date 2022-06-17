import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountsManager } from './accounts-manager';

export const AccountsContainer = () => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return <AccountsManager partyId={keypair.pub} />;
};
