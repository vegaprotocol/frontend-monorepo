import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { Filter } from './order-list-manager';
import { OrderListManager } from './order-list-manager';

export interface OrderListContainerProps {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  enforceBottomPlaceholder?: boolean;
  filter?: Filter;
}

export const OrderListContainer = ({
  marketId,
  onMarketClick,
  onOrderTypeClick,
  enforceBottomPlaceholder,
  filter,
}: OrderListContainerProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <OrderListManager
      partyId={pubKey}
      marketId={marketId}
      filter={filter}
      onMarketClick={onMarketClick}
      onOrderTypeClick={onOrderTypeClick}
      isReadOnly={isReadOnly}
      enforceBottomPlaceholder={enforceBottomPlaceholder}
    />
  );
};
