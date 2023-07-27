/* eslint-disable @typescript-eslint/no-explicit-any */
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMarket } from '../../test-helpers';
import { StopOrder } from './deal-ticket-stop-order';
import * as Schema from '@vegaprotocol/types';
import { MockedProvider } from '@apollo/client/testing';
import type { StopOrderFormValues } from '../../hooks/use-stop-order-form-values';
import { useStopOrderFormValues } from '../../hooks/use-stop-order-form-values';

jest.mock('zustand');
jest.mock('./deal-ticket-fee-details', () => ({
  DealTicketFeeDetails: () => <div data-testid="deal-ticket-fee-details" />,
}));

const marketPrice = '200';
const market = generateMarket();
const submit = jest.fn();

function generateJsx(pubKey = 'pubKey', isReadOnly = false) {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey, isReadOnly } as any}>
        <StopOrder market={market} marketPrice={marketPrice} submit={submit} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
}

describe('StopOrder', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should display ticket defaults', async () => {
    render(generateJsx());
    // place order button should always be enabled
    expect(screen.getByTestId('place-order')).toBeEnabled();

    // Assert defaults are used
    expect(screen.getByTestId('order-type-StopLimit').dataset.state).toEqual(
      'checked'
    );

    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue('0');
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );
    expect(
      screen.getByTestId('triggerDirection-risesAbove').dataset.state
    ).toEqual('checked');
    expect(screen.getByTestId('triggerType-price').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('expire').dataset.state).toEqual('unchecked');
    act(() => {
      screen.getByTestId('expire').click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('expiryStrategy-submit').dataset.state).toEqual(
        'checked'
      );
    });
  });

  it('should display trigger price as price for market type order', async () => {
    render(generateJsx());
    screen.getByTestId('order-type-StopMarket').click();
    await userEvent.type(screen.getByTestId('triggerPrice'), '10');
    expect(screen.getByTestId('price')).toHaveTextContent('10.0');
  });

  it('should use local storage state for initial values', () => {
    const values: Partial<StopOrderFormValues> = {
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      expire: true,
      expiryStrategy: Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS,
      expiresAt: '2023-07-27T16:43:27',
    };

    useStopOrderFormValues.setState({
      formValues: {
        [market.id]: values,
      },
    });

    render(generateJsx());
    // Assert correct defaults are used from store
    expect(screen.queryByTestId('order-type-StopLimit')).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      values.size as string
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(values.timeInForce);
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      values.price as string
    );
    expect(screen.getByTestId('expire').dataset.state).toEqual('checked');
    expect(screen.getByTestId('expiryStrategy-cancel').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      values.size as string
    );
  });
});
