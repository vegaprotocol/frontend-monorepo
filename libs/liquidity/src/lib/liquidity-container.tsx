import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { LiquidityManager } from './liquidity-manager';

export const LiquidityContainer = ({ marketId }: { marketId: string }) => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return <LiquidityManager partyId={keypair.pub} marketId={marketId} />;
};
