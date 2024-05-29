import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useHasAmendableOrder } from '@vegaprotocol/orders';
import {
  ShowCurrentMarketOnly,
  useShowCurrentMarketOnlyStore,
} from '../orders-container';
import { useT } from '../../lib/use-t';

export const OpenOrdersMenu = ({ marketId }: { marketId: string }) => {
  const { isReadOnly } = useVegaWallet();
  const create = useVegaTransactionStore((state) => state.create);
  const showCurrentMarketOnly = useShowCurrentMarketOnlyStore(
    (state) => state.showCurrentMarketOnly
  );
  const hasAmendableOrder = useHasAmendableOrder({
    marketId: showCurrentMarketOnly ? marketId : undefined,
  });

  return (
    <>
      <ShowCurrentMarketOnly />
      {!isReadOnly && hasAmendableOrder ? (
        <CancelAllOrdersButton
          onClick={() => {
            create({
              orderCancellation: showCurrentMarketOnly ? { marketId } : {},
            });
          }}
        />
      ) : null}
    </>
  );
};

const CancelAllOrdersButton = ({ onClick }: { onClick: () => void }) => {
  const t = useT();
  return (
    <TradingButton size="extra-small" onClick={onClick} data-testid="cancelAll">
      {t('Cancel all')}
    </TradingButton>
  );
};
