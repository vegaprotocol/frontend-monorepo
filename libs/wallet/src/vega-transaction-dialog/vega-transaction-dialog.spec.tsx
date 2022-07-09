import { render, screen } from '@testing-library/react';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import type { Order } from '../vega-order-transaction-dialog';
import { VegaOrderTransactionType } from '../vega-order-transaction-dialog';
import type { VegaTransactionDialogProps } from './vega-transaction-dialog';
import { VegaTransactionDialog } from './vega-transaction-dialog';

describe('VegaTransactionDialog', () => {
  let defaultProps: VegaTransactionDialogProps;

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
      type: VegaOrderTransactionType.CANCEL,
    };
  });

  it('should render when an order is successfully cancelled', () => {
    render(<VegaTransactionDialog {...defaultProps} />);
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

    render(
      <VegaTransactionDialog
        {...defaultProps}
        {...propsForTest}
        type={VegaOrderTransactionType.CANCEL}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Cancellation failed'
    );
  });
});
