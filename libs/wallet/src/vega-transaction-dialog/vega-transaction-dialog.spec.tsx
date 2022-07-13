import { render, screen } from '@testing-library/react';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import type { Order } from '../wallet-types';
import type { VegaTransactionDialogProps } from './vega-transaction-dialog';
import { VegaDialog, VegaTransactionDialog } from './vega-transaction-dialog';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_EXPLORER_URL: 'https://test.explorer.vega.network',
  }),
}));

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
      title: 'Order cancelled',
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
        title={'Cancellation failed'}
      />
    );
    expect(screen.getByTestId('order-status-header')).toHaveTextContent(
      'Cancellation failed'
    );
  });

  describe('TransactionDialog', () => {
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
        <VegaDialog
          finalizedOrder={finalizedOrder}
          transaction={transaction}
          title={'Order placed'}
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
        <VegaDialog
          finalizedOrder={finalizedOrder}
          transaction={transaction}
          title={'Order tx'}
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
        <VegaDialog
          finalizedOrder={finalizedOrder}
          transaction={transaction}
          title={'Order tx'}
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
        <VegaDialog
          finalizedOrder={finalizedOrder}
          transaction={transaction}
          title={'Order title'}
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
        <VegaDialog
          finalizedOrder={null}
          transaction={transaction}
          title={'Order title'}
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
        <VegaDialog
          finalizedOrder={null}
          transaction={transaction}
          title={'Order Tx'}
        />
      );
      expect(screen.getByTestId('order-status-header')).toHaveTextContent(
        'Awaiting network confirmation'
      );
      expect(screen.getByTestId('tx-block-explorer')).toHaveTextContent(
        'View in block explorer'
      );
      expect(screen.getByTestId('tx-block-explorer')).toHaveAttribute(
        'href',
        'https://test.explorer.vega.network/txs/0xTxHash'
      );
    });
  });
});
