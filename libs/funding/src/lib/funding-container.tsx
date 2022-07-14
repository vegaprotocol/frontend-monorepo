import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { FundingManager } from './funding-manager';

export const FundingContainer = () => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return <FundingManager partyId={keypair.pub} />;
};
