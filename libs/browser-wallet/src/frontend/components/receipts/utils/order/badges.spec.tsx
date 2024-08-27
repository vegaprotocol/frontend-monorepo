import { render, screen } from '@testing-library/react';
import { OrderTimeInForce } from '@vegaprotocol/rest-clients/dist/trading-data';

import { silenceErrors } from '@/test-helpers/silence-errors';

import { OrderBadges } from './badges';

describe('OrderBadges component', () => {
  // TODO: Set explicit date format for tests
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('renders Good til date badge when timeInForce is GTT', () => {
    // 1119-ORBD-004 If time in force is GTT then I can see the expiry of the order
    const mockExpiresAt = (1e9).toString();
    render(
      <OrderBadges
        postOnly={false}
        reduceOnly={false}
        timeInForce={OrderTimeInForce.TIME_IN_FORCE_GTT}
        expiresAt={mockExpiresAt}
      />
    );

    expect(
      screen.getByText('Good til 1/1/1970, 12:00:01 AM')
    ).toBeInTheDocument();
  });

  it('renders TIF badge when timeInForce is not GTT', () => {
    // 1119-ORBD-003 I can see a badge of the order time in force
    render(
      <OrderBadges
        postOnly={false}
        reduceOnly={false}
        timeInForce={OrderTimeInForce.TIME_IN_FORCE_GTC}
        expiresAt={undefined}
      />
    );

    expect(screen.getByText('GTC')).toBeVisible();
  });

  it('renders post only badge when postOnly is true', () => {
    // 1119-ORBD-001 I can see a badge if the order is post only
    render(
      <OrderBadges
        postOnly={true}
        reduceOnly={false}
        timeInForce={OrderTimeInForce.TIME_IN_FORCE_GTC}
        expiresAt={undefined}
      />
    );

    expect(screen.getByText('Post only')).toBeVisible();
  });

  it('renders reduce only badge when reduceOnly is true', () => {
    // 1119-ORBD-002 I can see a badge if the order is reduce only
    render(
      <OrderBadges
        postOnly={false}
        reduceOnly={true}
        timeInForce={OrderTimeInForce.TIME_IN_FORCE_GTC}
        expiresAt={undefined}
      />
    );

    expect(screen.getByText('Reduce only')).toBeVisible();
  });

  it('throws error if GTT order does not have expiresAt', () => {
    silenceErrors();
    expect(() =>
      render(
        <OrderBadges
          postOnly={false}
          reduceOnly={false}
          timeInForce={OrderTimeInForce.TIME_IN_FORCE_GTT}
          expiresAt={undefined}
        />
      )
    ).toThrow('GTT order without expiresAt');
  });
});
