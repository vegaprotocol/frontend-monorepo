import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderListManager } from './order-list-manager';
import { Filter } from './order-list-manager';

export interface OrderListContainerProps {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  enforceBottomPlaceholder?: boolean;
  filter?: Filter;
  storeKey?: string;
}

export const OrderListContainer = ({
  marketId,
  onMarketClick,
  onOrderTypeClick,
  enforceBottomPlaceholder,
  filter,
  storeKey,
}: OrderListContainerProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <OrderListManager
      partyId={pubKey}
      marketId={marketId}
      filter={Filter.Open}
      onMarketClick={onMarketClick}
      onOrderTypeClick={onOrderTypeClick}
      isReadOnly={isReadOnly}
      enforceBottomPlaceholder={enforceBottomPlaceholder}
      storeKey={storeKey}
    />
  );
};
