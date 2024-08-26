/* eslint-disable jest/expect-expect */
import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { locators as tableLocators } from '../../../data-table';
import { locators, StopOrderSubmission } from './submission';

jest.mock('../../utils/order-table', () => ({
  OrderTable: () => <div data-testid="order-table" />,
}));
jest.mock('../../utils/order/badges', () => ({
  OrderBadges: () => <div data-testid="order-badges" />,
}));

const validateStopOrderDetails = (type: string) => {
  const [triggerPrice, trailingPercentOffset, expiryStrategy, expiresAt] =
    screen.getAllByTestId(tableLocators.dataRow);

  expect(screen.getByTestId(locators.sectionHeader)).toHaveTextContent(type);
  expect(triggerPrice).toHaveTextContent('Trigger price');
  expect(triggerPrice).toHaveTextContent('100');
  expect(trailingPercentOffset).toHaveTextContent('Trailing offset');
  expect(trailingPercentOffset).toHaveTextContent('5%');
  expect(expiryStrategy).toHaveTextContent('Expiry strategy');
  expect(expiryStrategy).toHaveTextContent('Submit');
  expect(expiresAt).toHaveTextContent('Expires at');
  // TODO: Set explicit date format for tests
  // expect(expiresAt).toHaveTextContent('1/1/1970, 12:27:18 AM');
  expect(screen.getByTestId(locators.orderDetails)).toHaveTextContent(
    'Order details'
  );
  expect(screen.getByTestId('order-table')).toBeTruthy();
  expect(screen.getByTestId('order-badges')).toBeTruthy();
};

const renderComponent = ({ transaction }: { transaction: any }) =>
  render(
    <MockNetworkProvider>
      <StopOrderSubmission transaction={transaction} />
    </MockNetworkProvider>
  );

describe('StopOrderSubmission', () => {
  it('renders the component with "Rises above" details', () => {
    // 1121-STPS-001 If a rises above order is present I see the rises above section
    // 1121-STPS-003 In each section I can see the trigger price
    // 1121-STPS-004 In each section I can see the all the details of the order
    const transaction = {
      stopOrdersSubmission: {
        risesAbove: {
          expiryStrategy: 'EXPIRY_STRATEGY_SUBMIT',
          price: 100,
          expiresAt: 1_638_534_000_000,
          trailingPercentOffset: 5,
          orderSubmission: {
            marketId: 'market1',
          },
        },
        fallsBelow: null,
      },
    };

    renderComponent({ transaction });
    validateStopOrderDetails('Rises Above ↗');
  });

  it('renders the component with "Falls below" details', () => {
    // 1121-STPS-002 If a falls below is present I see the falls below section
    // 1121-STPS-003 In each section I can see the trigger price
    // 1121-STPS-004 In each section I can see the all the details of the order
    const transaction = {
      stopOrdersSubmission: {
        risesAbove: null,
        fallsBelow: {
          expiryStrategy: 'EXPIRY_STRATEGY_SUBMIT',
          price: 100,
          expiresAt: 1_638_534_000_000,
          trailingPercentOffset: 5,
          orderSubmission: {
            marketId: 'market2',
          },
        },
      },
    };

    renderComponent({ transaction });

    validateStopOrderDetails('Falls Below ↘');
  });

  it('does not render falls below or rises above if not present', () => {
    const transaction = {
      stopOrdersSubmission: {},
    };
    renderComponent({ transaction });

    expect(
      screen.queryByTestId(locators.sectionHeader)
    ).not.toBeInTheDocument();
  });

  it('does not render stop order fields if not present', () => {
    const transaction = {
      stopOrdersSubmission: {
        risesAbove: {
          orderSubmission: {},
        },
      },
    };
    renderComponent({ transaction });

    const rows = screen.queryAllByTestId(tableLocators.dataRow);
    expect(rows).toHaveLength(0);
  });
});
