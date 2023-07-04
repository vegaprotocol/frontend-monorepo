import type { MockedResponse } from '@apollo/client/testing';

import { MockedProvider } from '@apollo/client/testing';
import OrderSummary from './order-summary';
import type { OrderSummaryModifier } from './order-summary';
import { render } from '@testing-library/react';
import { ExplorerDeterministicOrderDocument } from '../order-details/__generated__/Order';

const mock = {
  request: {
    query: ExplorerDeterministicOrderDocument,
    variables: {
      orderId: '123',
    },
  },
  result: {
    data: {
      orderByID: {
        __typename: 'Order',
        id: '123',
        type: 'GTC',
        status: 'OPEN',
        version: '1',
        createdAt: 'Tue, Jan 10, 2023 3:35',
        expiresAt: 'Tue, Jan 10, 2023 3:35',
        updatedAt: 'Tue, Jan 10, 2023 3:35',
        rejectionReason: null,
        reference: null,
        timeInForce: 'GTC',
        price: '333',
        side: 'SIDE_BUY',
        remaining: '100',
        size: '100',
        peggedOrder: null,
        party: {
          id: '456',
        },
        market: {
          __typename: 'Market',
          id: '789',
          state: 'STATE_ACTIVE',
          positionDecimalPlaces: 2,
          decimalPlaces: 2,
          tradableInstrument: {
            instrument: {
              name: 'TEST',
              product: {
                __typename: 'Future',
                quoteName: '123',
              },
            },
          },
        },
      },
    },
  },
};
function renderComponent(
  id: string,
  mocks?: MockedResponse[],
  modifier?: OrderSummaryModifier
) {
  return render(
    <MockedProvider mocks={mocks}>
      <OrderSummary id={id} modifier={modifier} />
    </MockedProvider>
  );
}

describe('Order Summary component', () => {
  it('side, size are present', async () => {
    const res = renderComponent(mock.result.data.orderByID.id, [mock]);
    expect(await res.findByText('Buy')).toBeInTheDocument();
    expect(await res.findByText('100')).toBeInTheDocument();
    // Note: Market is not mocked so the PriceInMarket component is not rendering in this test - hence no price formatting
  });

  it('Cancelled modifier add strikethrough', async () => {
    const res = renderComponent(
      mock.result.data.orderByID.id,
      [mock],
      'cancelled'
    );
    const buy = await res.findByText('Buy');
    expect(buy.parentElement).toHaveClass('line-through');
  });
});
