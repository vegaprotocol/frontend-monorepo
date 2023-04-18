import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderListManager } from './order-list-manager';

export const OrderListContainer = ({
  marketId,
  onMarketClick,
  onOrderTypeClick,
  enforceBottomPlaceholder,
}: {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  enforceBottomPlaceholder?: boolean;
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
      onOrderTypeClick={onOrderTypeClick}
      isReadOnly={isReadOnly}
      enforceBottomPlaceholder={enforceBottomPlaceholder}
    />
  );
};
