import { render, screen } from '@testing-library/react';

import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { CancellationView } from './cancellation-view';

jest.mock('@/stores/markets-store');

jest.mock('../../utils/order-table', () => ({
  OrderTable: () => <div data-testid="order-table"></div>,
}));
jest.mock('../../utils/order/badges', () => ({
  OrderBadges: () => <div data-testid="order-badges"></div>,
}));

describe('CancellationView', () => {
  it('renders OrderTable with the order and market ids', () => {
    // 1117-ORDC-004 I can see the [order table](./1130-ODTB-order_table.md)
    // 1117-ORDC-005 I can see the [order badges](./1119-ORBD-order_badges.md)
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        id: '1',
        tradableInstrument: {
          instrument: {
            code: 'BTC/USD',
          },
        },
      }),
    });
    render(
      <CancellationView cancellation={{ orderId: '123', marketId: 'abc' }} />
    );
    expect(screen.getByTestId('order-table')).toBeInTheDocument();
    expect(screen.getByTestId('order-badges')).toBeInTheDocument();
  });
});
