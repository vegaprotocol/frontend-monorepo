import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { PositionsManager } from './positions-manager';

export const PositionsContainer = () => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <p>Please connect Vega wallet</p>
      </Splash>
    );
  }

  return <PositionsManager partyId={keypair.pub} />;
};
