import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { FillsManager } from './fills-manager';

export const FillsContainer = () => {
  const { pubKey } = useVegaWallet();

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return <FillsManager partyId={pubKey} />;
};
