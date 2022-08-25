import { useVegaWallet } from '@vegaprotocol/wallet';
import { LiquidityManager } from './liquidity-manager';

export const LiquidityContainer = ({ marketId }: { marketId: string }) => {
  const { keypair } = useVegaWallet();
  return <LiquidityManager partyId={keypair?.pub} marketId={marketId} />;
};
