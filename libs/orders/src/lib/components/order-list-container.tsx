import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderListManager } from './order-list-manager';
import type { Filter } from './order-list-manager/use-order-list-data';

export const OrderListContainer = ({
  marketId,
  onMarketClick,
  onOrderTypeClick,
  enforceBottomPlaceholder,
  filter,
}: {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  enforceBottomPlaceholder?: boolean;
  filter?: Filter;
}) => {
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
