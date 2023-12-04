/* eslint-disable @typescript-eslint/no-explicit-any */
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
import { useFeatureFlags } from '@vegaprotocol/environment';
import { formatForInput } from '@vegaprotocol/utils';

jest.mock('zustand');
jest.mock('./deal-ticket-fee-details', () => ({
  DealTicketFeeDetails: () => <div data-testid="deal-ticket-fee-details" />,
}));

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
const triggerDirectionFallsBelow = 'triggerDirection-fallsBelow';

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

const numberOfActiveOrdersLimit = 'stop-order-warning-limit';

const ocoPostfix = (id: string, postfix = true) => (postfix ? `${id}-oco` : id);

const mockDataProvider = jest.fn((...args) => ({
  data: Array(0),
  reload: jest.fn(),
}));
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((...args) => mockDataProvider(...args)),
}));

describe('StopOrder', () => {
  beforeEach(() => {
    localStorage.clear();
    useFeatureFlags.setState({ flags: { STOP_ORDERS: true } });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should display ticket defaults limit order', async () => {
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

  it('should display ticket defaults market order', async () => {
    render(generateJsx());
    // place order button should always be enabled
    expect(screen.getByTestId(submitButton)).toBeEnabled();
    // Assert defaults are used
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    expect(screen.getByTestId(orderTypeLimit).dataset.state).toEqual(
      'unchecked'
    );
    expect(screen.getByTestId(orderTypeMarket).dataset.state).toEqual(
      'checked'
    );
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    expect(screen.getByTestId(orderSideBuy).dataset.state).toEqual('checked');
    expect(screen.getByTestId(sizeInput)).toHaveDisplayValue('0');
    expect(screen.getByTestId(timeInForce)).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );
    // 7002-SORD-084
    expect(
      screen.getByTestId(triggerDirectionRisesAbove).dataset.state
    ).toEqual('checked');
    // 7002-SORD-085
    expect(
      screen.getByTestId(triggerDirectionFallsBelow).dataset.state
    ).toEqual('unchecked');
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

  it.each([
    { fieldName: 'size', ocoValue: false },
    { fieldName: 'ocoSize', ocoValue: true },
    { fieldName: 'size', ocoValue: false, orderTypeMarketValue: true },
    { fieldName: 'ocoSize', ocoValue: true, orderTypeMarketValue: true },
  ])(
    'validates $fieldName field',
    async ({ ocoValue, orderTypeMarketValue }) => {
      render(generateJsx());
      if (orderTypeMarketValue) {
        await userEvent.click(screen.getByTestId(orderTypeTrigger));
        await userEvent.click(screen.getByTestId(orderTypeMarket));
      }
      if (ocoValue) {
        await userEvent.click(screen.getByTestId(oco));
      }
      await userEvent.click(screen.getByTestId(submitButton));
      const getByTestId = (id: string) =>
        screen.getByTestId(ocoPostfix(id, ocoValue));
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
    }
  );

  it.each([
    { fieldName: 'price', ocoValue: false },
    { fieldName: 'ocoPrice', ocoValue: true },
  ])('validates $fieldName field', async ({ ocoValue }) => {
    render(generateJsx());

    if (ocoValue) {
      await userEvent.click(screen.getByTestId(oco));
    }
    await userEvent.click(screen.getByTestId(submitButton));

    const getByTestId = (id: string) =>
      screen.getByTestId(ocoPostfix(id, ocoValue));
    const queryByTestId = (id: string) =>
      screen.queryByTestId(ocoPostfix(id, ocoValue));
    // 7002-SORD-095
    expect(getByTestId(priceErrorMessage)).toBeInTheDocument();
    await userEvent.type(getByTestId(priceInput), '0.001');
    expect(getByTestId(priceErrorMessage)).toBeInTheDocument();

    // switch to market order type error should disappear
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    await userEvent.click(screen.getByTestId(submitButton));
    expect(queryByTestId(priceErrorMessage)).toBeNull();

    // switch back to limit type
    await userEvent.click(screen.getByTestId(orderTypeTrigger));
    await userEvent.click(screen.getByTestId(orderTypeLimit));
    await userEvent.click(screen.getByTestId(submitButton));
    expect(getByTestId(priceErrorMessage)).toBeInTheDocument();

    // to small value should be invalid
    await userEvent.type(getByTestId(priceInput), '0.001');
    expect(getByTestId(priceErrorMessage)).toBeInTheDocument();

    // clear and fill using valid value
    await userEvent.clear(getByTestId(priceInput));
    await userEvent.type(getByTestId(priceInput), '0.01');
    expect(queryByTestId(priceErrorMessage)).toBeNull();
  });

  it.each([
    { fieldName: 'triggerPrice', ocoValue: false },
    { fieldName: 'ocoTriggerPrice', ocoValue: true },
    { fieldName: 'triggerPrice', ocoValue: false, orderTypeMarketValue: true },
    {
      fieldName: 'ocoTriggerPrice',
      ocoValue: true,
      orderTypeMarketValue: true,
    },
  ])(
    'validates $fieldName field',
    async ({ ocoValue, orderTypeMarketValue }) => {
      render(generateJsx());
      if (orderTypeMarketValue) {
        await userEvent.click(screen.getByTestId(orderTypeTrigger));
        await userEvent.click(screen.getByTestId(orderTypeMarket));
      }
      if (ocoValue) {
        await userEvent.click(screen.getByTestId(oco));
        await userEvent.click(screen.getByTestId(triggerDirectionFallsBelow));
      }
      await userEvent.click(screen.getByTestId(submitButton));
      const getByTestId = (id: string) =>
        screen.getByTestId(ocoPostfix(id, ocoValue));
      const queryByTestId = (id: string) =>
        screen.queryByTestId(ocoPostfix(id, ocoValue));
      // 7002-SORD-095
      // 7002-SORD-087

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
    }
  );

  it.each([
    { fieldName: 'trailingPercentageOffset', ocoValue: false },
    { fieldName: 'ocoTrailingPercentageOffset', ocoValue: true },
    {
      fieldName: 'trailingPercentageOffset',
      ocoValue: false,
      orderTypeMarket: true,
    },
    {
      fieldName: 'ocoTrailingPercentageOffset',
      ocoValue: true,
      orderTypeMarket: true,
    },
  ])('validates $fieldName field', async ({ ocoValue }) => {
    render(generateJsx());
    if (orderTypeMarket) {
      await userEvent.click(screen.getByTestId(orderTypeTrigger));
      await userEvent.click(screen.getByTestId(orderTypeMarket));
    }
    if (ocoValue) {
      await userEvent.click(screen.getByTestId(oco));
    }
    await userEvent.click(screen.getByTestId(submitButton));
    const getByTestId = (id: string) =>
      screen.getByTestId(ocoPostfix(id, ocoValue));
    const queryByTestId = (id: string) =>
      screen.queryByTestId(ocoPostfix(id, ocoValue));

    // should not show error with default form values
    expect(queryByTestId(triggerTrailingPercentOffsetErrorMessage)).toBeNull();

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
    await userEvent.type(getByTestId(triggerTrailingPercentOffsetInput), '0.1');
    expect(queryByTestId(triggerTrailingPercentOffsetErrorMessage)).toBeNull();

    // to big value should be invalid
    await userEvent.clear(getByTestId(triggerTrailingPercentOffsetInput));
    await userEvent.type(
      getByTestId(triggerTrailingPercentOffsetInput),
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
    expect(queryByTestId(triggerTrailingPercentOffsetErrorMessage)).toBeNull();
  });

  it('sync oco trigger', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId(oco));
    // 7002-SORD-099
    expect(
      screen.getByTestId(triggerDirectionRisesAbove).dataset.state
    ).toEqual('checked');
    // 7002-SORD-091
    expect(
      screen.getByTestId(ocoPostfix(triggerDirectionFallsBelow)).dataset.state
    ).toEqual('checked');
    await userEvent.click(screen.getByTestId(triggerDirectionFallsBelow));
    expect(
      screen.getByTestId(triggerDirectionRisesAbove).dataset.state
    ).toEqual('unchecked');
    expect(
      screen.getByTestId(ocoPostfix(triggerDirectionFallsBelow)).dataset.state
    ).toEqual('unchecked');
    await userEvent.click(
      screen.getByTestId(ocoPostfix(triggerDirectionFallsBelow))
    );
    expect(
      screen.getByTestId(triggerDirectionRisesAbove).dataset.state
    ).toEqual('checked');
    expect(
      screen.getByTestId(ocoPostfix(triggerDirectionFallsBelow)).dataset.state
    ).toEqual('checked');
  });

  it('disables submit expiry strategy when OCO selected', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId(expire));
    await userEvent.click(screen.getByTestId(expiryStrategySubmit));
    await userEvent.click(screen.getByTestId(oco));
    expect(screen.getByTestId(expiryStrategySubmit).dataset.state).toEqual(
      'unchecked'
    );
    expect(screen.getByTestId(expiryStrategySubmit)).toBeDisabled();
    await userEvent.click(screen.getByTestId(oco));
    await userEvent.click(screen.getByTestId(expiryStrategySubmit));
    expect(screen.getByTestId(expiryStrategySubmit).dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId(expiryStrategySubmit)).not.toBeDisabled();
  });

  it('sets expiry time/date to now if expiry is changed to checked', async () => {
    const now = 24 * 60 * 60 * 1000;
    render(generateJsx());
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    await userEvent.click(screen.getByTestId(expire));

    // expiry time/date was empty it should be set to now
    expect(
      new Date(screen.getByTestId<HTMLInputElement>(datePicker).value).getTime()
    ).toEqual(now);

    // set to the value in the past (now - 1s)
    fireEvent.change(screen.getByTestId<HTMLInputElement>(datePicker), {
      target: { value: formatForInput(new Date(now - 1000)) },
    });
    expect(
      new Date(
        screen.getByTestId<HTMLInputElement>(datePicker).value
      ).getTime() + 1000
    ).toEqual(now);

    // switch expiry off and on
    await userEvent.click(screen.getByTestId(expire));
    await userEvent.click(screen.getByTestId(expire));
    // expiry time/date was in the past it should be set to now
    expect(
      new Date(screen.getByTestId<HTMLInputElement>(datePicker).value).getTime()
    ).toEqual(now);
  });

  it('shows limit of active stop orders number', async () => {
    mockDataProvider.mockReturnValue({
      reload: jest.fn(),
      data: Array(4),
    });
    render(generateJsx());
    expect(mockDataProvider.mock.lastCall?.[0].skip).toBe(true);
    await userEvent.type(screen.getByTestId(sizeInput), '0.01');
    expect(mockDataProvider.mock.lastCall?.[0].skip).toBe(false);
    // 7002-SORD-011
    expect(screen.getByTestId(numberOfActiveOrdersLimit)).toBeInTheDocument();
  });

  it('counts oco as two orders', async () => {
    mockDataProvider.mockReturnValue({
      reload: jest.fn(),
      data: Array(3),
    });
    render(generateJsx());
    await userEvent.type(screen.getByTestId(sizeInput), '0.01');
    expect(screen.queryByTestId(numberOfActiveOrdersLimit)).toBeNull();
    await userEvent.click(screen.getByTestId(oco));
    expect(screen.getByTestId(numberOfActiveOrdersLimit)).toBeInTheDocument();
  });
});
