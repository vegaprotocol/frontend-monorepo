import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderListManager } from './order-list-manager';

export const OrderListContainer = ({
  marketId,
  onMarketClick,
}: {
  marketId?: string;
  onMarketClick?: (marketId: string) => void;
}) => {
  const { pubKey, isReadOnly } = useVegaWallet();

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <OrderListManager
      partyId={pubKey}
      marketId={marketId}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
    />
  );
};
