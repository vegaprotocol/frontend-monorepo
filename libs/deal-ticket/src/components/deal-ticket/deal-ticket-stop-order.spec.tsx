/* eslint-disable @typescript-eslint/no-explicit-any */
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMarket } from '../../test-helpers';
import { StopOrder } from './deal-ticket-stop-order';
import * as Schema from '@vegaprotocol/types';
import { MockedProvider } from '@apollo/client/testing';
import type { StopOrderFormValues } from '../../hooks/use-form-values';
import {
  DealTicketType,
  useDealTicketFormValues,
} from '../../hooks/use-form-values';
import type { FeatureFlags } from '@vegaprotocol/environment';

jest.mock('zustand');
jest.mock('./deal-ticket-fee-details', () => ({
  DealTicketFeeDetails: () => <div data-testid="deal-ticket-fee-details" />,
}));

jest.mock('@vegaprotocol/environment', () => {
  const actual = jest.requireActual('@vegaprotocol/environment');
  return {
    ...actual,
    FLAGS: {
      ...actual.FLAGS,
      STOP_ORDERS: true,
    } as FeatureFlags,
  };
});

const marketPrice = '200';
const market = generateMarket();
const submit = jest.fn();

function generateJsx(pubKey: string | null = 'pubKey', isReadOnly = false) {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey, isReadOnly } as any}>
        <StopOrder market={market} marketPrice={marketPrice} submit={submit} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
}

const submitButton = 'place-order';
const sizeInput = 'order-size';
const priceInput = 'order-price';
const triggerPriceInput = 'triggerPrice';
const triggerTrailingPercentOffsetInput = 'triggerTrailingPercentOffset';

const orderTypeTrigger = 'order-type-Stop';
const orderTypeLimit = 'order-type-StopLimit';
const orderTypeMarket = 'order-type-StopMarket';

const orderSideBuy = 'order-side-SIDE_BUY';
const orderSideSell = 'order-side-SIDE_SELL';

const triggerDirectionRisesAbove = 'triggerDirection-risesAbove';
// const triggerDirectionFallsBelow = 'triggerDirection-fallsBelow';

const expiryStrategySubmit = 'expiryStrategy-submit';
const expiryStrategyCancel = 'expiryStrategy-cancel';

const triggerTypePrice = 'triggerType-price';
const triggerTypeTrailingPercentOffset = 'triggerType-trailingPercentOffset';

const expire = 'expire';
const datePicker = 'date-picker-field';
const timeInForce = 'order-tif';

const sizeErrorMessage = 'stop-order-error-message-size';
const priceErrorMessage = 'stop-order-error-message-price';
const triggerPriceErrorMessage = 'stop-order-error-message-trigger-price';
const triggerTrailingPercentOffsetErrorMessage =
  'stop-order-error-message-trigger-trailing-percent-offset';

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
    expect(screen.getByTestId(submitButton)).toBeEnabled();

    // Assert defaults are used
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    expect(screen.getByTestId(orderTypeLimit).dataset.state).toEqual('checked');
    await userEvent.click(screen.getByTestId(orderTypeLimit));
    expect(screen.getByTestId(orderSideBuy).dataset.state).toEqual('checked');
    expect(screen.getByTestId(sizeInput)).toHaveDisplayValue('0');
    expect(screen.getByTestId(timeInForce)).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );
    expect(
      screen.getByTestId(triggerDirectionRisesAbove).dataset.state
    ).toEqual('checked');
    expect(screen.getByTestId(triggerTypePrice).dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId(expire).dataset.state).toEqual('unchecked');
    await userEvent.click(screen.getByTestId(expire));
    await waitFor(() => {
      expect(screen.getByTestId(expiryStrategySubmit).dataset.state).toEqual(
        'checked'
      );
    });
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should display trigger price as price for market type order', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    await userEvent.type(screen.getByTestId(triggerPriceInput), '10');
    expect(screen.getByTestId('price')).toHaveTextContent('10.0');
  });

  it('should use local storage state for initial values', async () => {
    const values: Partial<StopOrderFormValues> = {
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      expire: true,
      expiryStrategy: 'cancel',
      expiresAt: '2023-07-27T16:43:27.000',
    };

    useDealTicketFormValues.setState({
      formValues: {
        [market.id]: {
          [DealTicketType.StopLimit]: values,
        },
      },
    });

    render(generateJsx());
    // Assert correct defaults are used from store
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    expect(screen.queryByTestId(orderTypeLimit)).toBeChecked();
    expect(screen.getByTestId(orderSideSell).dataset.state).toEqual('checked');
    expect(screen.getByTestId(sizeInput)).toHaveDisplayValue(
      values.size as string
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(values.timeInForce);
    expect(screen.getByTestId(priceInput)).toHaveDisplayValue(
      values.price as string
    );
    expect(screen.getByTestId(expire).dataset.state).toEqual('checked');
    expect(screen.getByTestId(expiryStrategyCancel).dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId(datePicker)).toHaveDisplayValue(
      values.expiresAt as string
    );
  });

  it('does not submit if no wallet connected', async () => {
    render(generateJsx(null));
    await userEvent.type(screen.getByTestId(sizeInput), '1');
    await userEvent.type(screen.getByTestId(priceInput), '1');
    await userEvent.type(screen.getByTestId(triggerPriceInput), '1');
    await userEvent.click(screen.getByTestId(submitButton));
    expect(submit).not.toBeCalled();
  });

  it('calls submit if form is valid', async () => {
    render(generateJsx());
    await userEvent.type(screen.getByTestId(sizeInput), '1');
    await userEvent.type(screen.getByTestId(priceInput), '1');
    await userEvent.type(screen.getByTestId(triggerPriceInput), '1');
    await userEvent.click(screen.getByTestId(submitButton));
    expect(submit).toBeCalled();
  });

  it('validates size field', async () => {
    render(generateJsx());

    await userEvent.click(screen.getByTestId(submitButton));

    // default value should be invalid
    expect(screen.getByTestId(sizeErrorMessage)).toBeInTheDocument();
    // to small value should be invalid
    await userEvent.type(screen.getByTestId(sizeInput), '0.01');
    expect(screen.getByTestId(sizeErrorMessage)).toBeInTheDocument();

    // clear and fill using valid value
    await userEvent.clear(screen.getByTestId(sizeInput));
    await userEvent.type(screen.getByTestId(sizeInput), '0.1');
    expect(screen.queryByTestId(sizeErrorMessage)).toBeNull();
  });

  it('validates price field', async () => {
    render(generateJsx());

    await userEvent.click(screen.getByTestId(submitButton));
    // price error message should not show if size has error
    // expect(screen.queryByTestId(priceErrorMessage)).toBeNull();
    // await userEvent.type(screen.getByTestId(sizeInput), '0.1');
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();
    await userEvent.type(screen.getByTestId(priceInput), '0.001');
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // switch to market order type error should disappear
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    await userEvent.click(screen.getByTestId(submitButton));
    expect(screen.queryByTestId(priceErrorMessage)).toBeNull();

    // switch back to limit type
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeLimit));
    await userEvent.click(screen.getByTestId(submitButton));
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // to small value should be invalid
    await userEvent.type(screen.getByTestId(priceInput), '0.001');
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // clear and fill using valid value
    await userEvent.clear(screen.getByTestId(priceInput));
    await userEvent.type(screen.getByTestId(priceInput), '0.01');
    expect(screen.queryByTestId(priceErrorMessage)).toBeNull();
  });

  it('validates trigger price field', async () => {
    render(generateJsx());

    await userEvent.click(screen.getByTestId(submitButton));
    expect(screen.getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();

    // switch to trailing percentage offset trigger type
    await userEvent.click(screen.getByTestId(triggerTypeTrailingPercentOffset));
    expect(screen.queryByTestId(triggerPriceErrorMessage)).toBeNull();

    // switch back to price trigger type
    await userEvent.click(screen.getByTestId(triggerTypePrice));
    expect(screen.getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();

    // to small value should be invalid
    await userEvent.type(screen.getByTestId(triggerPriceInput), '0.001');
    expect(screen.getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();

    // clear and fill using valid value
    await userEvent.clear(screen.getByTestId(triggerPriceInput));
    await userEvent.type(screen.getByTestId(triggerPriceInput), '0.01');
    expect(screen.queryByTestId(triggerPriceErrorMessage)).toBeNull();
  });

  it('validates trigger trailing percentage offset field', async () => {
    render(generateJsx());

    // should not show error with default form values
    await userEvent.click(screen.getByTestId(submitButton));
    expect(
      screen.queryByTestId(triggerTrailingPercentOffsetErrorMessage)
    ).toBeNull();

    // switch to trailing percentage offset trigger type
    await userEvent.click(screen.getByTestId(triggerTypeTrailingPercentOffset));
    expect(
      screen.getByTestId(triggerTrailingPercentOffsetErrorMessage)
    ).toBeInTheDocument();

    // to small value should be invalid
    await userEvent.type(
      screen.getByTestId(triggerTrailingPercentOffsetInput),
      '0.09'
    );
    expect(
      screen.getByTestId(triggerTrailingPercentOffsetErrorMessage)
    ).toBeInTheDocument();

    // clear and fill using valid value
    await userEvent.clear(
      screen.getByTestId(triggerTrailingPercentOffsetInput)
    );
    await userEvent.type(
      screen.getByTestId(triggerTrailingPercentOffsetInput),
      '0.1'
    );
    expect(
      screen.queryByTestId(triggerTrailingPercentOffsetErrorMessage)
    ).toBeNull();

    // to big value should be invalid
    await userEvent.clear(
      screen.getByTestId(triggerTrailingPercentOffsetInput)
    );
    await userEvent.type(
      screen.getByTestId(triggerTrailingPercentOffsetInput),
      '99.91'
    );
    expect(
      screen.getByTestId(triggerTrailingPercentOffsetErrorMessage)
    ).toBeInTheDocument();

    // clear and fill using valid value
    await userEvent.clear(
      screen.getByTestId(triggerTrailingPercentOffsetInput)
    );
    await userEvent.type(
      screen.getByTestId(triggerTrailingPercentOffsetInput),
      '99.9'
    );
    expect(
      screen.queryByTestId(triggerTrailingPercentOffsetErrorMessage)
    ).toBeNull();
  });
});
