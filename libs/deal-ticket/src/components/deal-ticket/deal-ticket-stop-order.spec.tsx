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

const oco = 'oco';
const expire = 'expire';
const datePicker = 'date-picker-field';
const timeInForce = 'order-tif';

const sizeErrorMessage = 'stop-order-error-message-size';
const priceErrorMessage = 'stop-order-error-message-price';
const triggerPriceErrorMessage = 'stop-order-error-message-trigger-price';
const triggerPriceWarningMessage = 'stop-order-warning-message-trigger-price';
const triggerTrailingPercentOffsetErrorMessage =
  'stop-order-error-message-trigger-trailing-percent-offset';

const ocoPostfix = (id: string, postfix = true) => (postfix ? `${id}-oco` : id);

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
    expect(screen.getByTestId(oco).dataset.state).toEqual('unchecked');
    await userEvent.click(screen.getByTestId(expire));
    await waitFor(() => {
      expect(screen.getByTestId(expiryStrategySubmit).dataset.state).toEqual(
        'checked'
      );
    });
  });

  it('calculate notional for market limit', async () => {
    render(generateJsx());
    await userEvent.type(screen.getByTestId(sizeInput), '10');
    await userEvent.type(screen.getByTestId(priceInput), '10');
    expect(screen.getByTestId('deal-ticket-fee-notional')).toHaveTextContent(
      'Notional100.00 BTC'
    );
  });

  it('calculates notional for limit order', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    await userEvent.type(screen.getByTestId(sizeInput), '10');
    // price trigger is selected but it's empty, calculate base on size and marketPrice prop
    expect(screen.getByTestId('deal-ticket-fee-notional')).toHaveTextContent(
      'Notional20.00 BTC'
    );

    await userEvent.type(screen.getByTestId(triggerPriceInput), '3');
    // calculate base on size and price trigger
    expect(screen.getByTestId('deal-ticket-fee-notional')).toHaveTextContent(
      'Notional30.00 BTC'
    );
  });

  it('should use local storage state for initial values', async () => {
    const values: Partial<StopOrderFormValues> = {
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      expire: true,
      expiryStrategy: Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS,
      expiresAt: '2023-07-27T16:43:27.000',
      oco: true,
      ocoType: Schema.OrderType.TYPE_LIMIT,
      ocoSize: '0.2',
      ocoPrice: '300.23',
      ocoTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
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
    expect(screen.getByTestId(timeInForce)).toHaveValue(values.timeInForce);
    expect(screen.getByTestId(priceInput)).toHaveDisplayValue(
      values.price as string
    );

    expect(screen.getByTestId(ocoPostfix(sizeInput))).toHaveDisplayValue(
      values.ocoSize as string
    );
    expect(screen.getByTestId(ocoPostfix(timeInForce))).toHaveValue(
      values.ocoTimeInForce
    );
    expect(screen.getByTestId(ocoPostfix(priceInput))).toHaveDisplayValue(
      values.ocoPrice as string
    );
    expect(screen.getByTestId('ocoTypeLimit').dataset.state).toEqual('checked');

    expect(screen.getByTestId(expire).dataset.state).toEqual('checked');
    expect(screen.getByTestId(expiryStrategyCancel).dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId(datePicker)).toHaveDisplayValue(
      values.expiresAt as string
    );

    await userEvent.click(screen.getByTestId(orderTypeMarket));
    expect(screen.getByTestId(oco).dataset.state).toEqual('unchecked');
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
    [false, true].forEach(async (ocoValue) => {
      if (ocoValue) {
        await userEvent.click(screen.getByTestId(oco));
      }
      const getByTestId = (id: string) => screen.getByTestId(id);
      const queryByTestId = (id: string) =>
        screen.queryByTestId(ocoPostfix(id, ocoValue));
      // default value should be invalid
      expect(getByTestId(sizeErrorMessage)).toBeInTheDocument();
      // to small value should be invalid
      await userEvent.type(getByTestId(sizeInput), '0.01');
      expect(getByTestId(sizeErrorMessage)).toBeInTheDocument();

      // clear and fill using valid value
      await userEvent.clear(getByTestId(sizeInput));
      await userEvent.type(getByTestId(sizeInput), '0.1');
      expect(queryByTestId(sizeErrorMessage)).toBeNull();
    });
  });

  it('validates price field', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId(submitButton));
    [false, true].forEach(async (ocoValue) => {
      if (ocoValue) {
        await userEvent.click(screen.getByTestId(oco));
      }
      const getByTestId = (id: string) => screen.getByTestId(id);
      const queryByTestId = (id: string) =>
        screen.queryByTestId(ocoPostfix(id, ocoValue));
      expect(getByTestId(priceErrorMessage)).toBeInTheDocument();
      await userEvent.type(getByTestId(priceInput), '0.001');
      expect(getByTestId(priceErrorMessage)).toBeInTheDocument();

      // switch to market order type error should disappear
      await userEvent.click(getByTestId(orderTypeTrigger));
      await userEvent.click(getByTestId(orderTypeMarket));
      await userEvent.click(getByTestId(submitButton));
      expect(queryByTestId(priceErrorMessage)).toBeNull();

      // switch back to limit type
      await userEvent.click(getByTestId(orderTypeTrigger));
      await userEvent.click(getByTestId(orderTypeLimit));
      await userEvent.click(getByTestId(submitButton));
      expect(getByTestId(priceErrorMessage)).toBeInTheDocument();

      // to small value should be invalid
      await userEvent.type(getByTestId(priceInput), '0.001');
      expect(getByTestId(priceErrorMessage)).toBeInTheDocument();

      // clear and fill using valid value
      await userEvent.clear(getByTestId(priceInput));
      await userEvent.type(getByTestId(priceInput), '0.01');
      expect(queryByTestId(priceErrorMessage)).toBeNull();
    });
  });

  it('validates trigger price field', async () => {
    render(generateJsx());

    await userEvent.click(screen.getByTestId(submitButton));
    [false, true].forEach(async (ocoValue) => {
      if (ocoValue) {
        await userEvent.click(screen.getByTestId(oco));
      }
      const getByTestId = (id: string) => screen.getByTestId(id);
      const queryByTestId = (id: string) =>
        screen.queryByTestId(ocoPostfix(id, ocoValue));
      expect(getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();

      // switch to trailing percentage offset trigger type
      await userEvent.click(getByTestId(triggerTypeTrailingPercentOffset));
      expect(queryByTestId(triggerPriceErrorMessage)).toBeNull();

      // switch back to price trigger type
      await userEvent.click(getByTestId(triggerTypePrice));
      expect(getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();

      // to small value should be invalid
      await userEvent.type(getByTestId(triggerPriceInput), '0.001');
      expect(getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();

      // clear and fill using value causing immediate trigger
      await userEvent.clear(getByTestId(triggerPriceInput));
      await userEvent.type(getByTestId(triggerPriceInput), '0.01');
      expect(queryByTestId(triggerPriceErrorMessage)).toBeNull();
      expect(queryByTestId(triggerPriceWarningMessage)).toBeInTheDocument();

      // change to correct value
      await userEvent.type(getByTestId(triggerPriceInput), '2');
      expect(queryByTestId(triggerPriceWarningMessage)).toBeNull();
    });
  });

  it('validates trigger trailing percentage offset field', async () => {
    render(generateJsx());

    await userEvent.click(screen.getByTestId(submitButton));
    [false, true].forEach(async (ocoValue) => {
      if (ocoValue) {
        await userEvent.click(screen.getByTestId(oco));
      }
      const getByTestId = (id: string) => screen.getByTestId(id);
      const queryByTestId = (id: string) =>
        screen.queryByTestId(ocoPostfix(id, ocoValue));

      // should not show error with default form values
      expect(getByTestId(triggerPriceErrorMessage)).toBeInTheDocument();
      expect(
        queryByTestId(triggerTrailingPercentOffsetErrorMessage)
      ).toBeNull();

      // switch to trailing percentage offset trigger type
      await userEvent.click(getByTestId(triggerTypeTrailingPercentOffset));
      expect(
        getByTestId(triggerTrailingPercentOffsetErrorMessage)
      ).toBeInTheDocument();

      // to small value should be invalid
      await userEvent.type(
        getByTestId(triggerTrailingPercentOffsetInput),
        '0.09'
      );
      expect(
        getByTestId(triggerTrailingPercentOffsetErrorMessage)
      ).toBeInTheDocument();

      // clear and fill using valid value
      await userEvent.clear(getByTestId(triggerTrailingPercentOffsetInput));
      await userEvent.type(
        getByTestId(triggerTrailingPercentOffsetInput),
        '0.1'
      );
      expect(
        queryByTestId(triggerTrailingPercentOffsetErrorMessage)
      ).toBeNull();

      // to big value should be invalid
      await userEvent.clear(getByTestId(triggerTrailingPercentOffsetInput));
      await userEvent.type(
        screen.getByTestId(triggerTrailingPercentOffsetInput),
        '99.91'
      );
      expect(
        getByTestId(triggerTrailingPercentOffsetErrorMessage)
      ).toBeInTheDocument();

      // clear and fill using valid value
      await userEvent.clear(getByTestId(triggerTrailingPercentOffsetInput));
      await userEvent.type(
        getByTestId(triggerTrailingPercentOffsetInput),
        '99.9'
      );
      expect(
        screen.queryByTestId(triggerTrailingPercentOffsetErrorMessage)
      ).toBeNull();
    });
  });
});
