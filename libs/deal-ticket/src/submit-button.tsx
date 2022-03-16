import { Button } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import { Market_market } from '@vegaprotocol/graphql';
import { useMemo } from 'react';
import { Order } from './use-order-state';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { TransactionStatus } from './deal-ticket';

interface SubmitButtonProps {
  transactionStatus: TransactionStatus;
  market: Market_market;
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
        order.timeInForce === OrderTimeInForce.FOK ||
        order.timeInForce === OrderTimeInForce.IOC ||
        order.timeInForce === OrderTimeInForce.GFN
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
        className="w-full"
        variant="primary"
        type="submit"
        disabled={disabled}
      >
        {transactionStatus === 'pending' ? 'Pending...' : 'Place order'}
      </Button>
      {invalidText && (
        <p className="text-intent-danger text-center my-4">{invalidText}</p>
      )}
    </>
  );
};
