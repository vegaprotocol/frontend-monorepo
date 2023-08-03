import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { useHasAmendableOrder } from '../../order-hooks';

export const OpenOrdersMenu = ({ marketId }: { marketId: string }) => {
  const create = useVegaTransactionStore((state) => state.create);
  const hasAmendableOrder = useHasAmendableOrder(marketId);

  if (!hasAmendableOrder) {
    return null;
  }

  return (
    <CancelAllOrdersButton
      onClick={() => {
        create({
          orderCancellation: {},
        });
      }}
    />
  );
};

const CancelAllOrdersButton = ({ onClick }: { onClick: () => void }) => (
  <TradingButton size="extra-small" onClick={onClick} data-testid="cancelAll">
    {t('Cancel all')}
  </TradingButton>
);
