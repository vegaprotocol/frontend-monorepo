import { render, screen } from '@testing-library/react';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import type { Order } from './vega-transaction-dialog';
import { VegaTransactionDialog } from './vega-transaction-dialog';

describe('VegaTransactionDialog', () => {
  it('should render when an order is successful', () => {
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
    render(
      <VegaTransactionDialog
        finalizedOrder={finalizedOrder}
        transaction={transaction}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order placed'
    );
  });

  it('should render when transaction is requested', () => {
    const transaction: VegaTxState = {
      status: VegaTxStatus.Requested,
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
    render(
      <VegaTransactionDialog
        finalizedOrder={finalizedOrder}
        transaction={transaction}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Confirm transaction in wallet'
    );
  });

  it('should render when transaction has error', () => {
    const transaction: VegaTxState = {
      status: VegaTxStatus.Error,
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
    render(
      <VegaTransactionDialog
        finalizedOrder={finalizedOrder}
        transaction={transaction}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order rejected by wallet'
    );
  });

  it('should render when an order is rejected', () => {
    const transaction: VegaTxState = {
      status: VegaTxStatus.Default,
      error: null,
      txHash: null,
      signature: null,
    };
    const finalizedOrder: Order = {
      status: OrderStatus.Rejected,
      rejectionReason: null,
      size: '10',
      price: '1000',
      market: null,
      type: OrderType.Limit,
    };
    render(
      <VegaTransactionDialog
        finalizedOrder={finalizedOrder}
        transaction={transaction}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order failed'
    );
  });

  it('should render when pending consensus', () => {
    const transaction: VegaTxState = {
      status: VegaTxStatus.Error,
      error: null,
      txHash: null,
      signature: null,
    };
    render(
      <VegaTransactionDialog finalizedOrder={null} transaction={transaction} />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order rejected by wallet'
    );
  });
});
