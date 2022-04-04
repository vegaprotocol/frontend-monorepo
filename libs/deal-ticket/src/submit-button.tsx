import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import type { Order } from './use-order-state';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { TransactionStatus } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';

interface SubmitButtonProps {
  transactionStatus: TransactionStatus;
  market: DealTicketQuery_market;
  order: Order;
}

export const SubmitButton = ({
  market,
  transactionStatus,
  order,
}: SubmitButtonProps) => {
  const { keypair } = useVegaWallet();

  const invalidText = useMemo(() => {
    if (!keypair) {
      return t('No public key selected');
    }

    if (keypair.tainted) {
      return t('Selected public key has been tainted');
    }

    if (market.state !== MarketState.Active) {
      if (market.state === MarketState.Suspended) {
        return t('Market is currently suspended');
      }

      if (
        market.state === MarketState.Proposed ||
        market.state === MarketState.Pending
      ) {
        return t('Market is not active yet');
      }

      return t('Market is no longer active');
    }

    if (market.tradingMode !== MarketTradingMode.Continuous) {
      if (order.type === OrderType.Market) {
        return t('Only limit orders are permitted when market is in auction');
      }

      if (
        [
          OrderTimeInForce.FOK,
          OrderTimeInForce.IOC,
          OrderTimeInForce.GFN,
        ].includes(order.timeInForce)
      ) {
        return t(
          'Only GTT, GTC and GFA are permitted when market is in auction'
        );
      }
    }

    return '';
  }, [keypair, market, order]);

  const disabled = transactionStatus === 'pending' || Boolean(invalidText);

  return (
    <>
      <Button
        className="w-full mb-8"
        variant="primary"
        type="submit"
        disabled={disabled}
        data-testid="place-order"
      >
        {transactionStatus === 'pending' ? t('Pending...') : t('Place order')}
      </Button>
      {invalidText && <InputError className="mb-8">{invalidText}</InputError>}
    </>
  );
};
