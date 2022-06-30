import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { FillsManager } from './fills-manager';

export const FillsContainer = () => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return <FillsManager partyId={keypair.pub} />;
};
