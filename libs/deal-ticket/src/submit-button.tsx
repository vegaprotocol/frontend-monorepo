import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import { Order } from './use-order-state';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { TransactionStatus } from './deal-ticket';
import { DealTicketQuery_market } from './__generated__/DealTicketQuery';

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
      return 'No public key selected';
    }

    if (keypair.tainted) {
      return 'Selected public key has been tainted';
    }

    // TODO: Change these to use enums from @vegaprotocol/graphql
    if (market.state !== 'Active') {
      if (market.state === 'Suspended') {
        return 'Market is currently suspended';
      }

      if (market.state === 'Proposed' || market.state === 'Pending') {
        return 'Market is not active yet';
      }

      return 'Market is no longer active';
    }

    if (market.tradingMode !== 'Continuous') {
      if (order.type === OrderType.Market) {
        return 'Only limit orders are permitted when market is in auction';
      }

      if (
        [
          OrderTimeInForce.FOK,
          OrderTimeInForce.IOC,
          OrderTimeInForce.GFN,
        ].includes(order.timeInForce)
      ) {
        return 'Only GTT, GTC and GFA are permitted when market is in auction';
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
      >
        {transactionStatus === 'pending' ? 'Pending...' : 'Place order'}
      </Button>
      {invalidText && <InputError className="mb-8">{invalidText}</InputError>}
    </>
  );
};
