import { render, screen } from '@testing-library/react';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import type { VegaTxState, Order } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { CancelDialogProps } from './cancel-dialog';
import { CancelDialog } from './cancel-dialog';

describe('CancelDialog', () => {
  let defaultProps: CancelDialogProps;

  beforeEach(() => {
    defaultProps = {
      orderDialogOpen: true,
      setOrderDialogOpen: () => false,
      transaction: {
        status: VegaTxStatus.Default,
        error: null,
        txHash: null,
        signature: null,
      },
      finalizedOrder: {
        status: OrderStatus.Cancelled,
        rejectionReason: null,
        size: '10',
        price: '1000',
        market: null,
        type: OrderType.Limit,
      },
      reset: jest.fn(),
    };
  });

  it('should render when an order is successfully cancelled', () => {
    render(<CancelDialog {...defaultProps} />);
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order cancelled'
    );
  });

  it('should render when an order is not successfully cancelled', () => {
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
    const propsForTest = {
      transaction,
      finalizedOrder,
    };

    render(<CancelDialog {...defaultProps} {...propsForTest} />);
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Cancellation failed'
    );
  });
});
