import { Button } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import { Order } from './use-order-state';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Market } from './deal-ticket';
import { VegaTxStatus } from './use-vega-transaction';

interface SubmitButtonProps {
  status: VegaTxStatus;
  market: Market;
  order: Order;
}

export const SubmitButton = ({ market, status, order }: SubmitButtonProps) => {
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

  const disabled =
    status === VegaTxStatus.AwaitingConfirmation ||
    status === VegaTxStatus.Pending ||
    Boolean(invalidText);

  let text = 'Place order';

  if (status === VegaTxStatus.AwaitingConfirmation) {
    text = 'Awaiting confirmation...';
  } else if (status === VegaTxStatus.Pending) {
    text = 'Order pending';
  }

  return (
    <>
      <Button
        className="w-full"
        variant="primary"
        type="submit"
        disabled={disabled}
      >
        {text}
      </Button>
      {invalidText && (
        <p className="text-intent-danger text-center my-4">{invalidText}</p>
      )}
    </>
  );
};
