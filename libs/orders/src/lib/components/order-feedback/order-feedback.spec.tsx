import { render, screen } from '@testing-library/react';
import {
  OrderRejectionReasonMapping,
  OrderStatusMapping,
  Schema,
} from '@vegaprotocol/types';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { OrderEventFieldsFragment } from '../../order-hooks';
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
        dialogOpen: false,
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
      status: Schema.OrderStatus.STATUS_REJECTED,
      rejectionReason: Schema.OrderRejectionReason.ORDER_ERROR_AMEND_FAILURE,
    };
    const { status, ...order } = generateOrder(orderFields);
    const orderEvent = {
      ...order,
      orderStatus: status,
    } as OrderEventFieldsFragment;
    render(<OrderFeedback {...props} order={orderEvent} />);
    expect(screen.getByTestId('error-reason')).toHaveTextContent(
      `${OrderRejectionReasonMapping[orderFields.rejectionReason]}`
    );
  });

  it('should render order details when order is placed successfully', () => {
    const { status, ...order } = generateOrder({
      type: Schema.OrderType.TYPE_LIMIT,
      price: '100',
      size: '200',
      side: Schema.Side.SIDE_BUY,
      market: {
        decimalPlaces: 2,
        positionDecimalPlaces: 0,
      },
    });
    const orderEvent = {
      ...order,
      orderStatus: status,
    } as OrderEventFieldsFragment;
    render(<OrderFeedback {...props} order={orderEvent} />);
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
      order.market!.tradableInstrument.instrument.name
    );
    expect(screen.getByText('Status').nextElementSibling).toHaveTextContent(
      OrderStatusMapping[orderEvent.orderStatus]
    );
    expect(screen.getByText('Price').nextElementSibling).toHaveTextContent(
      '1.00'
    );
    expect(screen.getByText('Size').nextElementSibling).toHaveTextContent(
      `+200`
    );
  });
});
