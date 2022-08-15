import { render, screen } from '@testing-library/react';
import { formatLabel } from '@vegaprotocol/react-helpers';
import {
  OrderRejectionReason,
  OrderStatus,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { generateOrder } from '../mocks/generate-orders';
import type { OrderFeedbackProps } from './order-feedback';
import { OrderFeedback } from './order-feedback';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_EXPLORER_URL: 'https://test.explorer.vega.network',
  }),
}));

describe('OrderFeedback', () => {
  let props: OrderFeedbackProps;

  beforeEach(() => {
    props = {
      transaction: {
        status: VegaTxStatus.Complete,
        error: null,
        txHash: 'tx-hash',
        signature: null,
      },
      order: null,
    };
  });

  it('renders null if no order provided', () => {
    const { container } = render(<OrderFeedback {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders error reason', () => {
    const orderFields = {
      status: OrderStatus.Rejected,
      rejectionReason: OrderRejectionReason.OrderAmendFailure,
    };
    const order = generateOrder(orderFields);
    render(<OrderFeedback {...props} order={order} />);
    expect(screen.getByTestId('error-reason')).toHaveTextContent(
      `${formatLabel(orderFields.rejectionReason)}`
    );
  });

  it('should render order details when order is placed successfully', () => {
    const order = generateOrder({
      type: OrderType.Limit,
      price: '100',
      size: '200',
      side: Side.Buy,
      market: {
        decimalPlaces: 2,
        positionDecimalPlaces: 0,
      },
    });
    render(<OrderFeedback {...props} order={order} />);
    expect(screen.getByTestId('order-confirmed')).toBeInTheDocument();
    expect(screen.getByTestId('tx-block-explorer')).toHaveTextContent(
      // eslint-disable-next-line
      props.transaction.txHash!
    );
    expect(screen.getByTestId('tx-block-explorer')).toHaveTextContent(
      // eslint-disable-next-line
      props.transaction.txHash!
    );
    expect(screen.getByText('Market').nextElementSibling).toHaveTextContent(
      // eslint-disable-next-line
      order.market!.name
    );
    expect(screen.getByText('Status').nextElementSibling).toHaveTextContent(
      order.status
    );
    expect(screen.getByText('Price').nextElementSibling).toHaveTextContent(
      '1.00'
    );
    expect(screen.getByText('Size').nextElementSibling).toHaveTextContent(
      `+ 200`
    );
  });
});
