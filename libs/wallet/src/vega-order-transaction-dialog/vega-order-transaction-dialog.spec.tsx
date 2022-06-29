import { render, screen } from '@testing-library/react';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import type { Order } from './vega-order-transaction-dialog';
import { VegaOrderTransactionDialog } from './vega-order-transaction-dialog';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_EXPLORER_URL: 'https://test.explorer.vega.network',
  }),
}));

describe('VegaOrderTransactionDialog', () => {
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
      <VegaOrderTransactionDialog
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
      <VegaOrderTransactionDialog
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
      <VegaOrderTransactionDialog
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
      <VegaOrderTransactionDialog
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
      <VegaOrderTransactionDialog
        finalizedOrder={null}
        transaction={transaction}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Order rejected by wallet'
    );
  });

  it('should render awaiting network confirmation and add link to tx in block explorer', () => {
    const transaction: VegaTxState = {
      status: VegaTxStatus.Default,
      error: null,
      txHash: 'TxHash',
      signature: null,
    };
    render(
      <VegaOrderTransactionDialog
        finalizedOrder={null}
        transaction={transaction}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Awaiting network confirmation'
    );
    expect(screen.getByTestId('tx-hash')).toHaveTextContent('TxHash');
    expect(screen.getByTestId('tx-hash')).toHaveAttribute(
      'href',
      'https://test.explorer.vega.network/txs/0xTxHash'
    );
  });
});
