import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useVegaTransactionStore, useVegaWallet } from '@vegaprotocol/wallet';
import { useHasAmendableOrder } from '../../order-hooks';

export const OpenOrdersMenu = ({ marketId }: { marketId: string }) => {
  const { isReadOnly } = useVegaWallet();
  const create = useVegaTransactionStore((state) => state.create);
  const hasAmendableOrder = useHasAmendableOrder(marketId);

  if (isReadOnly) {
    return null;
  }

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
