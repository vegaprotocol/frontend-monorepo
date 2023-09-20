/* eslint-disable @typescript-eslint/no-explicit-any */
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMarket, generateMarketData } from '../../test-helpers';
import { DealTicket } from './deal-ticket';
import * as Schema from '@vegaprotocol/types';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OrdersQuery } from '@vegaprotocol/orders';
import {
  DealTicketType,
  useDealTicketFormValues,
} from '../../hooks/use-form-values';
import * as positionsTools from '@vegaprotocol/positions';
import { OrdersDocument } from '@vegaprotocol/orders';
import { formatForInput } from '@vegaprotocol/utils';
import type { PartialDeep } from 'type-fest';
import type { Market } from '@vegaprotocol/markets';

jest.mock('zustand');
jest.mock('./deal-ticket-fee-details', () => ({
  DealTicketFeeDetails: () => <div data-testid="deal-ticket-fee-details" />,
  DealTicketMarginDetails: () => (
    <div data-testid="deal-ticket-margin-details" />
  ),
}));

const marketPrice = '200';
const pubKey = 'pubKey';
const market = generateMarket();
const marketData = generateMarketData();
const submit = jest.fn();

function generateJsx(
  mocks: MockedResponse[] = [],
  marketOverrides: PartialDeep<Market> = {},
  marketDataOverrides: Partial<YourMarketDataType> = {}
) {
  const joinedMarket: Market = {
    ...market,
    ...marketOverrides,
  } as Market;

  const joinedMarketData: YourMarketDataType = {
    ...marketData,
    ...marketDataOverrides,
  } as YourMarketDataType;

  return (
    <MockedProvider mocks={[...mocks]}>
      <VegaWalletContext.Provider value={{ pubKey, isReadOnly: false } as any}>
        <DealTicket
          market={joinedMarket}
          marketData={joinedMarketData}
          marketPrice={marketPrice}
          submit={submit}
          onDeposit={jest.fn()}
        />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
}

describe('DealTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('check filtering of active orders', async () => {
    const mockOrders: OrdersQuery = {
      party: {
        id: 'pubKey',
        ordersConnection: {
          edges: [
            {
              node: {
                id: 'order-id-1',
                remaining: '101010',
                market: {
                  id: 'market-id',
                },
              },
            },
            {
              node: {
                id: 'order-id-2',
                remaining: '1111',
                market: {
                  id: 'other-market-id',
                },
              },
            },
          ],
        },
      },
    } as unknown as OrdersQuery;
    const orderMocks = {
      request: {
        query: OrdersDocument,
        variables: {
          partyId: 'pubKey',
          filter: { liveOnly: true },
          pagination: { first: 5000 },
        },
      },
      result: {
        data: mockOrders,
      },
    };
    jest.spyOn(positionsTools, 'useEstimatePositionQuery');
    render(generateJsx([orderMocks]));
    await waitFor(() => {
      expect(screen.getByTestId('deal-ticket-fee-details')).toBeInTheDocument();
      expect(
        (positionsTools.useEstimatePositionQuery as jest.Mock).mock.lastCall[0]
          .variables.orders
      ).toHaveLength(2);
      expect(
        (positionsTools.useEstimatePositionQuery as jest.Mock).mock.lastCall[0]
          .variables.orders[0].remaining
      ).toEqual('101010');
      expect(
        (positionsTools.useEstimatePositionQuery as jest.Mock).mock.lastCall[0]
          .variables.orders[1].remaining
      ).toEqual('0');
    });
  });

  it('should display ticket defaults', () => {
    render(generateJsx());

    // place order button should always be enabled
    expect(screen.getByTestId('place-order')).toBeEnabled();

    // Assert defaults are used
    expect(screen.getByTestId('order-type-Market')).toBeInTheDocument();
    expect(screen.getByTestId('order-type-Limit')).toBeInTheDocument();

    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );

    expect(screen.getByTestId('order-side-SIDE_BUY').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue('0');
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );
  });

  it('should use local storage state for initial values', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      persist: true,
    };

    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
  });

  it('should set values for a non-persistent reduce only order and disable post only checkbox', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      persist: false,
      reduceOnly: true,
      postOnly: false,
    };
    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeDisabled();
    expect(screen.getByTestId('reduce-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeChecked();
    expect(screen.getByTestId('post-only')).not.toBeChecked();
  });

  it('should set values for a persistent post only order and disable reduce only checkbox', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      persist: true,
      reduceOnly: false,
      postOnly: true,
    };

    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeDisabled();
    expect(screen.getByTestId('post-only')).toBeChecked();
    expect(screen.getByTestId('reduce-only')).not.toBeChecked();
  });

  it('should set values for a persistent post only iceberg order and disable reduce only checkbox', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '10',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      persist: true,
      reduceOnly: false,
      postOnly: true,
      iceberg: true,
      icebergOpts: {
        peakSize: '5',
        minimumVisibleSize: '7',
      },
    };

    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeDisabled();
    expect(screen.getByTestId('post-only')).toBeChecked();
    expect(screen.getByTestId('reduce-only')).not.toBeChecked();
    expect(screen.getByTestId('iceberg')).toBeEnabled();
    expect(screen.getByTestId('iceberg')).toBeChecked();
  });

  it('should set values for a non-persistent order and disable post only checkbox', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      persist: false,
      reduceOnly: false,
      postOnly: false,
    };
    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeDisabled();
    expect(screen.getByTestId('reduce-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).not.toBeChecked();
    expect(screen.getByTestId('post-only')).not.toBeChecked();
    expect(screen.getByTestId('iceberg')).not.toBeChecked();
    expect(screen.getByTestId('iceberg')).toBeDisabled();
  });

  it('handles TIF select box dependent on order type', async () => {
    render(generateJsx());

    act(() => {
      screen.getByTestId('order-type-Market').click();
    });

    // Only FOK and IOC should be present for type market order
    expect(
      Array.from(screen.getByTestId('order-tif').children).map(
        (o) => o.textContent
      )
    ).toEqual(['Fill or Kill (FOK)', 'Immediate or Cancel (IOC)']);

    // IOC should be default
    expect(screen.getByTestId('order-tif')).toHaveDisplayValue(
      'Immediate or Cancel (IOC)'
    );

    // Select FOK - FOK should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );
    expect(screen.getByTestId('order-tif')).toHaveDisplayValue(
      'Fill or Kill (FOK)'
    );

    // Switch to type limit order -> all TIF options should be shown
    await userEvent.click(screen.getByTestId('order-type-Limit'));
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );

    // expect GTC as LIMIT default
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Select GTT -> GTT should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Switch back to type market order -> FOK should be preserved from previous selection
    await userEvent.click(screen.getByTestId('order-type-Market'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Select IOC -> IOC should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch back type limit order -> GTT should be preserved
    await userEvent.click(screen.getByTestId('order-type-Limit'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Select GFN -> GFN should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFN
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFN
    );

    // Switch to type market order -> IOC should be preserved
    await userEvent.click(screen.getByTestId('order-type-Market'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
  });

  it('can edit deal ticket', async () => {
    // 7002-SORD-004
    // 7002-SORD-005
    // 7002-SORD-006
    // 7002-SORD-007
    render(generateJsx());

    // BUY is selected by default
    expect(screen.getByTestId('order-side-SIDE_BUY').dataset.state).toEqual(
      'checked'
    );

    await userEvent.type(screen.getByTestId('order-size'), '200');

    expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to limit order
    await userEvent.click(screen.getByTestId('order-type-Limit'));
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual(
      'checked'
    );

    // Check all TIF options shown
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );
    // Switch to market order
    await userEvent.click(screen.getByTestId('order-type-Market'));
    expect(screen.getByTestId('order-type-Market').dataset.state).toEqual(
      'checked'
    );

    // Switch to short order
    await userEvent.click(screen.getByTestId('order-side-SIDE_SELL'));
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );

    // Switch to long order
    await userEvent.click(screen.getByTestId('order-side-SIDE_BUY'));
    expect(screen.getByTestId('order-side-SIDE_BUY').dataset.state).toEqual(
      'checked'
    );
  });

  it('validates size field', async () => {
    render(generateJsx());
    const sizeErrorMessage = 'deal-ticket-error-message-size';
    const sizeInput = 'order-size';
    await userEvent.click(screen.getByTestId('place-order'));
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
    const priceErrorMessage = 'deal-ticket-error-message-price';
    const priceInput = 'order-price';
    const submitButton = 'place-order';
    const orderTypeMarket = 'order-type-Market';
    const orderTypeLimit = 'order-type-Limit';
    render(generateJsx());

    await userEvent.click(screen.getByTestId(submitButton));

    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();
    await userEvent.type(screen.getByTestId(priceInput), '0.001');
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // switch to market order type error should disappear
    await userEvent.click(screen.getByTestId(orderTypeMarket));
    await userEvent.click(screen.getByTestId(submitButton));
    expect(screen.queryByTestId(priceErrorMessage)).toBeNull();

    // switch back to limit type
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

  it('validates size when positionDecimalPlaces is negative', async () => {
    render(generateJsx([], { positionDecimalPlaces: -4 }));
    const sizeErrorMessage = 'deal-ticket-error-message-size';
    const sizeInput = 'order-size';
    await userEvent.click(screen.getByTestId('place-order'));
    // default value should be invalid
    expect(screen.getByTestId(sizeErrorMessage)).toBeInTheDocument();
    expect(screen.getByTestId(sizeErrorMessage)).toHaveTextContent(
      'Size cannot be lower than 10000'
    );
    await userEvent.type(screen.getByTestId(sizeInput), '10001');
    expect(screen.getByTestId(sizeErrorMessage)).toHaveTextContent(
      'Size must be a multiple of 10000 for this market'
    );
    await userEvent.clear(screen.getByTestId(sizeInput));
    await userEvent.type(screen.getByTestId(sizeInput), '10000');
    expect(screen.queryByTestId(sizeErrorMessage)).toBeNull();
  });

  it('validates iceberg field', async () => {
    const peakSizeErrorMessage = 'deal-ticket-peak-error-message';
    const minimumSizeErrorMessage = 'deal-ticket-minimum-error-message';
    const sizeInput = 'order-size';
    const peakSizeInput = 'order-peak-size';
    const minimumSizeInput = 'order-minimum-size';
    const submitButton = 'place-order';

    render(generateJsx());
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFA
    );
    await userEvent.click(screen.getByTestId('iceberg'));
    await userEvent.click(screen.getByTestId(submitButton));

    // validate empty fields
    expect(screen.getByTestId(peakSizeErrorMessage)).toBeInTheDocument();
    expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await userEvent.type(screen.getByTestId(peakSizeInput), '0.01');
    await userEvent.type(screen.getByTestId(minimumSizeInput), '0.01');

    // validate value smaller than step
    expect(screen.getByTestId(peakSizeErrorMessage)).toBeInTheDocument();
    expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await userEvent.clear(screen.getByTestId(peakSizeInput));
    await userEvent.type(screen.getByTestId(peakSizeInput), '0.5');
    await userEvent.clear(screen.getByTestId(minimumSizeInput));
    await userEvent.type(screen.getByTestId(minimumSizeInput), '0.7');

    await userEvent.clear(screen.getByTestId(sizeInput));
    await userEvent.type(screen.getByTestId(sizeInput), '0.1');

    // validate value higher than size
    expect(screen.getByTestId(peakSizeErrorMessage)).toBeInTheDocument();
    expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await userEvent.clear(screen.getByTestId(sizeInput));
    await userEvent.type(screen.getByTestId(sizeInput), '1');
    // validate peak higher than minimum
    expect(screen.queryByTestId(peakSizeErrorMessage)).toBeNull();
    expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await userEvent.clear(screen.getByTestId(peakSizeInput));
    await userEvent.type(screen.getByTestId(peakSizeInput), '1');
    await userEvent.clear(screen.getByTestId(minimumSizeInput));
    await userEvent.type(screen.getByTestId(minimumSizeInput), '1');

    // validate correct values
    expect(screen.queryByTestId(peakSizeErrorMessage)).toBeNull();
    expect(screen.queryByTestId(minimumSizeErrorMessage)).toBeNull();
  });

  it('sets expiry time/date to now if expiry is changed to checked', async () => {
    const datePicker = 'date-picker-field';
    const now = 24 * 60 * 60 * 1000;
    render(generateJsx());
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

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
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFA
    );
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );
    // expiry time/date was in the past it should be set to now
    expect(
      new Date(screen.getByTestId<HTMLInputElement>(datePicker).value).getTime()
    ).toEqual(now);
  });

  describe('market states not accepting orders', () => {
    const states = [
      Schema.MarketState.STATE_REJECTED,
      Schema.MarketState.STATE_CANCELLED,
      Schema.MarketState.STATE_CLOSED,
      Schema.MarketState.STATE_SETTLED,
      Schema.MarketState.STATE_TRADING_TERMINATED,
    ];

    states.forEach((marketState) => {
      describe(`Market State: ${marketState}`, () => {
        beforeEach(() => {
          const marketOverrides = { state: marketState };
          const marketDataOverrides = { marketState: marketState };
          render(generateJsx([], marketOverrides, marketDataOverrides));
        });

        it('must display that market is not accepting orders', async () => {
          const text = `This market is ${marketState
            .split('_')
            .pop()
            ?.toLowerCase()} and not accepting orders`;
          await waitFor(() => {
            expect(
              screen.getByTestId('deal-ticket-error-message-summary')
            ).toHaveTextContent(text);
          });
        });

        it('should have the place-order button enabled', () => {
          expect(screen.getByTestId('place-order')).toBeEnabled();
        });
      });
    });
  });
});
