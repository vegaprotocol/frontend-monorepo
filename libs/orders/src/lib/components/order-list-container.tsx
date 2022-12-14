import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderListManager } from './order-list-manager';

export const OrderListContainer = ({ marketId }: { marketId?: string }) => {
  const { pubKey } = useVegaWallet();

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return <OrderListManager partyId={pubKey} marketId={marketId} />;
};
