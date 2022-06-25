import { render, screen } from '@testing-library/react';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import type { VegaTxState, Order } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { CancelDialog } from './cancel-dialog';

describe('CancelDialog', () => {
  it('should render when an order is successfully cancelled', () => {
    const orderDialogOpen = true;
    const setOrderDialogOpen = () => false;
    const transaction: VegaTxState = {
      status: VegaTxStatus.Default,
      error: null,
      txHash: null,
      signature: null,
    };
    const finalizedOrder: Order = {
      status: OrderStatus.Cancelled,
      rejectionReason: null,
      size: '10',
      price: '1000',
      market: null,
      type: OrderType.Limit,
    };
    const reset = jest.fn();
    render(
      <CancelDialog
        orderDialogOpen={orderDialogOpen}
        setOrderDialogOpen={setOrderDialogOpen}
        finalizedOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order cancelled'
    );
  });

  it('should render when an order is not successfully cancelled', () => {
    const orderDialogOpen = true;
    const setOrderDialogOpen = () => false;
    const transaction: VegaTxState = {
      status: VegaTxStatus.Default,
      error: null,
      txHash: null,
      signature: null,
    };
    const finalizedOrder: Order = {
      status: OrderStatus.Active,
      rejectionReason: null,
      size: '10',
      price: '1000',
      market: null,
      type: OrderType.Limit,
    };
    const reset = jest.fn();
    render(
      <CancelDialog
        orderDialogOpen={orderDialogOpen}
        setOrderDialogOpen={setOrderDialogOpen}
        finalizedOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Cancellation failed'
    );
  });
});
