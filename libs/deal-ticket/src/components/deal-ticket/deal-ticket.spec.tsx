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
import type { MarketData } from '@vegaprotocol/markets';

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
  marketDataOverrides: Partial<MarketData> = {}
) {
  const joinedMarket: Market = {
    ...market,
    ...marketOverrides,
  } as Market;

  const joinedMarketData: MarketData = {
    ...marketData,
    ...marketDataOverrides,
  } as MarketData;

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
          pagination: { first: 1000 },
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
    // 7002-SORD-031
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );
    // 7002-SORD-018
    expect(screen.getByTestId('order-price').nextSibling).toHaveTextContent(
      'BTC'
    );
    expect(screen.getByTestId('order-connect-wallet')).toBeVisible();
  });

  it('market order should not display price', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('order-type-Market'));
    // 7002-SORD-018ß
    expect(screen.queryByTestId('order-price')).not.toBeInTheDocument();
  });

  it('market order must warn for whole numbers', async () => {
    const marketOverrides = { positionDecimalPlaces: 0 };
    render(generateJsx([], marketOverrides));
    await userEvent.click(screen.getByTestId('order-type-Market'));
    await userEvent.click(screen.getByTestId('place-order'));
    await userEvent.type(screen.getByTestId('order-size'), '1.231');
    // 7002-SORD-060
    expect(screen.queryByTestId('place-order')).toBeEnabled();
    // 7002-SORD-016
    expect(
      screen.queryByTestId('deal-ticket-error-message-size')
    ).toHaveTextContent('Size must be whole numbers for this market');
  });

  it('market order must warn if order size set to 0', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('order-type-Market'));
    await userEvent.click(screen.getByTestId('place-order'));
    await userEvent.type(screen.getByTestId('order-size'), '0');
    // 7002-SORD-060
    expect(screen.queryByTestId('place-order')).toBeEnabled();
    // 7002-SORD-016
    expect(
      screen.queryByTestId('deal-ticket-error-message-size')
    ).toHaveTextContent('Size cannot be lower than 0.1');
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

  it('should set values for a non-persistent reduce only order and disable post only checkbox', async () => {
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
    // 7003-SORD-054
    // 7003-SORD-055
    // 7003-SORD-057
    expect(screen.getByTestId('post-only')).toBeDisabled();
    expect(screen.getByTestId('reduce-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeChecked();
    expect(screen.getByTestId('post-only')).not.toBeChecked();
    userEvent.hover(screen.getByText('Reduce only'));
    // 7003-SORD-056
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toBeVisible();
    });

    userEvent.hover(screen.getByText('Post only'));
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toBeVisible();
    });
  });

  it('should set values for a persistent post only order and disable reduce only checkbox', async () => {
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
    // 7003-SORD-054
    // 7003-SORD-055
    // 7003-SORD-057
    expect(screen.getByTestId('post-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeDisabled();
    expect(screen.getByTestId('post-only')).toBeChecked();
    expect(screen.getByTestId('reduce-only')).not.toBeChecked();

    userEvent.hover(screen.getByText('Reduce only'));
    // 7003-SORD-056
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toBeVisible();
    });
    userEvent.hover(screen.getByText('Post only'));
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toBeVisible();
    });
  });

  it('should see an explanation of post only', async () => {
    render(generateJsx());
    userEvent.hover(screen.getByText('Post only'));
    // 7003-SORD-058
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toHaveTextContent(
        `"Post only" will ensure the order is not filled immediately but is placed on the order book as a passive order. When the order is processed it is either stopped (if it would not be filled immediately), or placed in the order book as a passive order until the price taker matches with it.`
      );
    });
  });

  it('should see an explanation of peak size', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('iceberg'));
    await userEvent.hover(screen.getByText('Peak size'));
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toHaveTextContent(
        `The maximum volume that can be traded at once. Must be less than the total size of the order.`
      );
    });
  });
  it('should see an explanation of minimum size', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('iceberg'));
    await userEvent.hover(screen.getByText('Minimum size'));
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toHaveTextContent(
        `When the order trades and its size falls below this threshold, it will be reset to the peak size and moved to the back of the priority order. Must be less than or equal to peak size, and greater than 0.`
      );
    });
  });

  it('should see an explanation of reduce only', async () => {
    render(generateJsx());
    userEvent.hover(screen.getByText('Reduce only'));
    // 7003-SORD-058
    await waitFor(() => {
      const tooltips = screen.getAllByTestId('tooltip-content');
      expect(tooltips[0]).toHaveTextContent(
        `"Reduce only" can be used only with non-persistent orders, such as "Fill or Kill" or "Immediate or Cancel".`
      );
    });
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
    // 7002-SORD-023
    // 7002-SORD-024
    // 7002-SORD-025
    // 7002-SORD-026
    // 7002-SORD-027
    // 7002-SORD-028
    expect(
      Array.from(screen.getByTestId('order-tif').children).map(
        (o) => o.textContent
      )
    ).toEqual([
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
    ]);

    // IOC should be default
    // 7002-SORD-030
    expect(screen.getByTestId('order-tif')).toHaveDisplayValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Select FOK - FOK should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );
    expect(screen.getByTestId('order-tif')).toHaveDisplayValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Switch to type limit order -> all TIF options should be shown
    // 7002-SORD-023
    // 7002-SORD-024
    // 7002-SORD-025
    // 7002-SORD-026
    // 7002-SORD-027
    // 7002-SORD-028
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

    it.each(states)('handles state %s correctly', async (marketState) => {
      const marketOverrides = { state: marketState };
      const marketDataOverrides = { marketState: marketState };
      render(generateJsx([], marketOverrides, marketDataOverrides));

      const text = `This market is ${marketState
        .split('_')
        .pop()
        ?.toLowerCase()} and not accepting orders`;

      await waitFor(() => {
        expect(
          screen.getByTestId('deal-ticket-error-message-summary')
        ).toHaveTextContent(text);
      });

      expect(screen.getByTestId('place-order')).toBeEnabled();
    });
  });
  it('must see warning if price has too many digits after decimal place', async () => {
    // 7002-SORD-059
    // Render component
    render(generateJsx());

    // Elements
    const toggleLimit = screen.getByTestId('order-type-Limit');
    const orderTIFDropDown = screen.getByTestId('order-tif');
    const orderSizeField = screen.getByTestId('order-price');
    const orderPriceField = screen.getByTestId('order-price');
    const placeOrderBtn = screen.getByTestId('place-order');

    // Actions
    await userEvent.click(toggleLimit);
    await userEvent.selectOptions(orderTIFDropDown, 'TIME_IN_FORCE_GTC');
    await userEvent.clear(orderSizeField);
    await userEvent.type(orderSizeField, '1');
    await userEvent.clear(orderPriceField);
    await userEvent.type(orderPriceField, '1.123456');
    await userEvent.click(placeOrderBtn);

    // Expectations
    await waitFor(() => {
      const errorMessage = screen.getByTestId(
        'deal-ticket-error-message-price'
      );
      expect(errorMessage).toHaveTextContent(
        'Price accepts up to 2 decimal places'
      );
    });
  });
  it('must see warning when placing an order with expiry date in past', async () => {
    // Render component
    render(generateJsx());

    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    // Elements
    const toggleLimit = screen.getByTestId('order-type-Limit');
    const orderPriceField = screen.getByTestId('order-price');
    const orderSizeField = screen.getByTestId('order-price');
    const orderTIFDropDown = screen.getByTestId('order-tif');
    const datePicker = 'date-picker-field';
    const placeOrderBtn = screen.getByTestId('place-order');

    // Actions
    userEvent.click(toggleLimit);
    userEvent.clear(orderPriceField);
    userEvent.type(orderPriceField, '0.1');
    userEvent.clear(orderSizeField);
    userEvent.type(orderSizeField, '1');
    await userEvent.selectOptions(
      orderTIFDropDown,
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Set date to past
    const expiresAt = new Date(now - 24 * 60 * 60 * 1000);
    const expiresAtInputValue = formatForInput(expiresAt);
    fireEvent.change(screen.getByTestId(datePicker), {
      target: { value: expiresAtInputValue },
    });

    // Place order
    userEvent.click(placeOrderBtn);

    // Expectations
    await waitFor(() => {
      const errorMessage = screen.getByTestId(
        'deal-ticket-error-message-expiry'
      );
      expect(errorMessage).toHaveTextContent(
        'The expiry date that you have entered appears to be in the past'
      );
    });
  });
});
