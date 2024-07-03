/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMarket, generateMarketData } from '../../test-helpers';
import { DealTicket } from './deal-ticket';
import * as Schema from '@vegaprotocol/types';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  OrderFieldsFragment,
  OrdersQuery,
  OrdersQueryVariables,
  OrdersUpdateSubscription,
  OrdersUpdateSubscriptionVariables,
} from '@vegaprotocol/orders';
import {
  DealTicketType,
  useDealTicketFormValues,
} from '@vegaprotocol/react-helpers';
import * as positionsTools from '@vegaprotocol/positions';
import { OrdersDocument, OrdersUpdateDocument } from '@vegaprotocol/orders';
import { formatForInput } from '@vegaprotocol/utils';
import type { PartialDeep } from 'type-fest';
import {
  MarketsDocument,
  type Market,
  type MarketInfo,
  type MarketsQuery,
  type MarketsQueryVariables,
} from '@vegaprotocol/markets';
import type { MarketData } from '@vegaprotocol/markets';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';
import {
  MarketDepthDocument,
  type MarketDepthQuery,
  type MarketDepthQueryVariables,
  MarketDepthUpdateDocument,
  type MarketDepthUpdateSubscription,
  type MarketDepthUpdateSubscriptionVariables,
} from '@vegaprotocol/market-depth';
import {
  AccountEventsDocument,
  type AccountEventsSubscription,
  type AccountEventsSubscriptionVariables,
  AccountsDocument,
  type AccountsQuery,
  type AccountsQueryVariables,
  MarginsDocument,
  type MarginsQuery,
  type MarginsQueryVariables,
  MarginsSubscriptionDocument,
  type MarginsSubscriptionSubscription,
  type MarginsSubscriptionSubscriptionVariables,
} from '@vegaprotocol/accounts';
import {
  AssetsDocument,
  type AssetsQuery,
  type AssetsQueryVariables,
} from '@vegaprotocol/assets';

jest.mock('zustand');
jest.mock('./deal-ticket-fee-details', () => ({
  DealTicketFeeDetails: () => <div data-testid="deal-ticket-fee-details" />,
}));
jest.mock('./deal-ticket-margin-details', () => ({
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
  const joinedMarket: MarketInfo = {
    ...market,
    ...marketOverrides,
  } as MarketInfo;

  const joinedMarketData: MarketData = {
    ...marketData,
    ...marketDataOverrides,
  } as MarketData;

  return (
    <MockedProvider mocks={[...mocks]}>
      <MockedWalletProvider>
        <DealTicket
          riskFactors={{
            market: market.id,
            short: '1.046438713957377',
            long: '0.526943480689886',
          }}
          scalingFactors={{
            searchLevel: 1.1,
            initialMargin: 1.5,
            collateralRelease: 1.7,
          }}
          market={joinedMarket}
          marketData={joinedMarketData}
          marketPrice={marketPrice}
          submit={submit}
          onDeposit={jest.fn()}
        />
      </MockedWalletProvider>
    </MockedProvider>
  );
}

describe('DealTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockConfig.store.setState({ pubKey });

    jest
      .spyOn(positionsTools, 'useEstimatePositionQuery')
      // @ts-ignore just return undefined to silence the estimate position query
      .mockReturnValue({ data: undefined });
  });

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  const selectTIF = async (value: Parameters<typeof screen.getByText>[0]) => {
    await userEvent.click(screen.getByTestId('order-tif'));
    await userEvent.click(
      within(screen.getByTestId('mini-select-content')).getByText(value)
    );
  };

  const marketDepthMock: MockedResponse<
    MarketDepthQuery,
    MarketDepthQueryVariables
  > = {
    request: {
      query: MarketDepthDocument,
      variables: { marketId: 'market-id' },
    },
    result: {
      data: {
        market: {
          id: 'market-id',
          depth: {
            sell: [],
            buy: [],
            sequenceNumber: '2',
          },
        },
      },
    },
  };

  const marketsDepthUpdateMock: MockedResponse<
    MarketDepthUpdateSubscription,
    MarketDepthUpdateSubscriptionVariables
  > = {
    request: {
      query: MarketDepthUpdateDocument,
      variables: { marketId: 'market-id' },
    },
    result: {
      data: {
        marketsDepthUpdate: [
          {
            marketId: 'market-id',
            sell: [],
            buy: [],
            sequenceNumber: '2',
            previousSequenceNumber: '1',
          },
        ],
      },
    },
  };

  const positionsMock: MockedResponse<
    positionsTools.PositionsQuery,
    positionsTools.PositionsQueryVariables
  > = {
    request: {
      query: positionsTools.PositionsDocument,
      variables: { partyIds: ['pubKey'] },
    },
    result: {
      data: {
        positions: {
          edges: [
            {
              node: {
                realisedPNL: '1',
                unrealisedPNL: '1',
                openVolume: '1',
                averageEntryPrice: '1',
                positionStatus:
                  Schema.PositionStatus.POSITION_STATUS_UNSPECIFIED,
                lossSocializationAmount: '0',
                updatedAt: '',
                market: {
                  id: 'market-id',
                },
                party: {
                  id: 'pubKey',
                },
              },
            },
          ],
        },
      },
    },
  };

  const positionsSubscriptionMock: MockedResponse<
    positionsTools.PositionsSubscriptionSubscription,
    positionsTools.PositionsSubscriptionSubscriptionVariables
  > = {
    request: {
      query: positionsTools.PositionsSubscriptionDocument,
      variables: { partyId: 'pubKey' },
    },
    result: {
      data: {
        positions: [
          {
            realisedPNL: '1',
            unrealisedPNL: '1',
            openVolume: '1',
            averageEntryPrice: '1',
            positionStatus: Schema.PositionStatus.POSITION_STATUS_UNSPECIFIED,
            lossSocializationAmount: '0',
            updatedAt: '',
            marketId: 'market-id',
            partyId: 'pubKey',
          },
        ],
      },
    },
  };

  const marginsMock: MockedResponse<MarginsQuery, MarginsQueryVariables> = {
    request: {
      query: MarginsDocument,
      // @ts-ignore the query gets passed marketId even though its not required. Not providing
      // it here leads to a mock warning
      variables: { partyId: 'pubKey', marketId: 'market-id' },
    },
    result: {
      data: {
        party: {
          id: 'pubKey',
          marginsConnection: {
            edges: [
              {
                node: {
                  maintenanceLevel: '1',
                  searchLevel: '1',
                  initialLevel: '1',
                  collateralReleaseLevel: '1',
                  marginFactor: '0.1',
                  marginMode: Schema.MarginMode.MARGIN_MODE_CROSS_MARGIN,
                  orderMarginLevel: '1',
                  asset: {
                    id: 'asset-id',
                  },
                  market: {
                    id: 'market-id',
                  },
                },
              },
            ],
          },
        },
      },
    },
  };

  const marginsSubscriptionMock: MockedResponse<
    MarginsSubscriptionSubscription,
    MarginsSubscriptionSubscriptionVariables
  > = {
    request: {
      query: MarginsSubscriptionDocument,
      // @ts-ignore the query gets passed marketId even though its not required. Not providing
      // it here leads to a mock warning
      variables: { partyId: 'pubKey', marketId: 'market-id' },
    },
    result: {
      data: {
        margins: {
          maintenanceLevel: '1',
          searchLevel: '1',
          initialLevel: '1',
          collateralReleaseLevel: '1',
          marginFactor: '0.1',
          marginMode: Schema.MarginMode.MARGIN_MODE_CROSS_MARGIN,
          orderMarginLevel: '1',
          asset: 'asset-id',
          marketId: 'market-id',
          partyId: 'pubKey',
          timestamp: '',
        },
      },
    },
  };

  const ordersSubscriptionMock: MockedResponse<
    OrdersUpdateSubscription,
    OrdersUpdateSubscriptionVariables
  > = {
    request: {
      query: OrdersUpdateDocument,
      variables: { partyId: 'pubKey' },
    },
    result: {
      data: {
        orders: [],
      },
    },
  };

  const assetsMock: MockedResponse<AssetsQuery, AssetsQueryVariables> = {
    request: {
      query: AssetsDocument,
    },
    result: {
      data: {
        assetsConnection: {
          edges: [],
        },
      },
    },
  };

  const marketMock: MockedResponse<MarketsQuery, MarketsQueryVariables> = {
    request: {
      query: MarketsDocument,
    },
    result: {
      data: {
        marketsConnection: {
          edges: [],
        },
      },
    },
  };

  const accountsMock: MockedResponse<AccountsQuery, AccountsQueryVariables> = {
    request: {
      query: AccountsDocument,
      variables: { partyId: 'pubKey' },
    },
    result: {
      data: {
        party: {
          id: 'pubKey',
          accountsConnection: {
            edges: [],
          },
        },
      },
    },
  };

  const accountsSubscriptoinMock: MockedResponse<
    AccountEventsSubscription,
    AccountEventsSubscriptionVariables
  > = {
    request: {
      query: AccountEventsDocument,
      variables: { partyId: 'pubKey' },
    },
    result: {
      data: {
        accounts: [],
      },
    },
  };

  const ordersMock: MockedResponse<OrdersQuery, OrdersQueryVariables> = {
    request: {
      query: OrdersDocument,
      variables: {
        partyId: 'pubKey',
        filter: { liveOnly: true },
        pagination: { first: 1000 },
      },
    },
    result: {
      data: {
        party: {
          id: pubKey,
          ordersConnection: {
            edges: [
              {
                node: {
                  id: 'order-id-1',
                  remaining: '101010',
                  market: {
                    id: 'market-id',
                  },
                } as OrderFieldsFragment,
              },
              {
                node: {
                  id: 'order-id-2',
                  remaining: '1111',
                  market: {
                    id: 'other-market-id',
                  },
                } as OrderFieldsFragment,
              },
            ],
          },
        },
      },
    },
  };

  const mocks = [
    marketMock,
    ordersMock,
    ordersSubscriptionMock,
    marketDepthMock,
    marketsDepthUpdateMock,
    positionsMock,
    positionsSubscriptionMock,
    marginsMock,
    marginsSubscriptionMock,
    assetsMock,
    accountsMock,
    accountsSubscriptoinMock,
  ];

  it('check filtering of active orders', async () => {
    jest.spyOn(positionsTools, 'useEstimatePositionQuery');

    render(generateJsx(mocks));

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
    render(generateJsx(mocks));

    // place order button should always be enabled
    expect(screen.getByTestId('place-order')).toBeEnabled();

    // Assert defaults are used
    expect(screen.getByTestId('order-type-Market')).toBeInTheDocument();
    expect(screen.getByTestId('order-type-Limit')).toBeInTheDocument();

    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');

    expect(screen.getByTestId('order-side-SIDE_BUY').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue('');
    // 7002-SORD-031
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );
    // 7002-SORD-018
    const input = screen.getByTestId('order-price');
    const inputWrapper = within(
      input.closest('[data-testid="ticket-input"]') as HTMLElement
    );
    expect(inputWrapper.getByLabelText('BTC')).toBeInTheDocument();
  });

  it('market order should not display price', async () => {
    const user = userEvent.setup();
    render(generateJsx(mocks));
    await user.click(screen.getByTestId('order-type-Market'));
    // 7002-SORD-018ß
    expect(screen.queryByTestId('order-price')).not.toBeInTheDocument();
  });

  it('market order must warn for whole numbers', async () => {
    const user = userEvent.setup();
    const marketOverrides = { positionDecimalPlaces: 0 };
    render(generateJsx(mocks, marketOverrides));
    await user.click(screen.getByTestId('order-type-Market'));
    await user.click(screen.getByTestId('place-order'));
    await user.type(screen.getByTestId('order-size'), '1.231');
    // 7002-SORD-060
    expect(screen.queryByTestId('place-order')).toBeEnabled();
    // 7002-SORD-016
    expect(
      screen.queryByTestId('deal-ticket-error-message-size')
    ).toHaveTextContent('Size must be whole numbers for this market');
  });

  it('market order must warn if order size set to 0', async () => {
    const user = userEvent.setup();
    render(generateJsx(mocks));
    await user.click(screen.getByTestId('order-type-Market'));
    await user.click(screen.getByTestId('place-order'));
    await user.type(screen.getByTestId('order-size'), '0');
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

    render(generateJsx(mocks));

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
  });

  it('should set values for a non-persistent reduce only order and disable post only checkbox', async () => {
    const user = userEvent.setup();
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      persist: false,
      postOnly: false,
    };

    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });

    render(generateJsx(mocks));

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    // 7003-SORD-054
    // 7003-SORD-055
    // 7003-SORD-057
    expect(screen.queryByTestId('post-only')).not.toBeInTheDocument();
    expect(screen.getByTestId('reduce-only')).toBeInTheDocument();
    expect(screen.getByTestId('reduce-only')).toBeEnabled();

    // 7003-SORD-056
    await user.hover(screen.getByText('Reduce only'));
    expect(await screen.findByRole('tooltip')).toBeVisible();
  });

  it('should set values for a persistent post only order and disable reduce only checkbox', async () => {
    const user = userEvent.setup();

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

    render(generateJsx(mocks));

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    // 7003-SORD-054
    // 7003-SORD-055
    // 7003-SORD-057
    expect(screen.getByTestId('post-only')).toBeEnabled();
    expect(screen.getByTestId('post-only')).toBeChecked();
    expect(screen.queryByTestId('reduce-only')).not.toBeInTheDocument();

    // 7003-SORD-056
    await user.hover(screen.getByText('Post only'));
    expect(await screen.findByRole('tooltip')).toBeVisible();
  });

  it('should see an explanation of post only', async () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      persist: true,
    };
    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Limit]: expectedOrder,
        },
      },
    });
    const user = userEvent.setup();
    render(generateJsx(mocks));
    await user.hover(screen.getByText('Post only'));
    // 7003-SORD-058
    const tooltips = await screen.findByRole('tooltip');
    expect(tooltips).toHaveTextContent(
      `"Post only" will ensure the order is not filled immediately but is placed on the order book as a passive order. When the order is processed it is either stopped (if it would not be filled immediately), or placed in the order book as a passive order until the price taker matches with it.`
    );
  });

  it('should see an explanation of peak size', async () => {
    const user = userEvent.setup();
    render(generateJsx(mocks));
    await user.click(screen.getByTestId('iceberg'));
    await user.hover(screen.getByText('Peak size'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `The maximum volume that can be traded at once. Must be less than the total size of the order.`
    );
  });

  it('should see an explanation of minimum size', async () => {
    const user = userEvent.setup();
    render(generateJsx(mocks));
    await user.click(screen.getByTestId('iceberg'));
    await user.hover(screen.getByText('Minimum size'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `When the order trades and its size falls below this threshold, it will be reset to the peak size and moved to the back of the priority order. Must be less than or equal to peak size, and greater than 0.`
    );
  });

  it('should see an explanation of reduce only', async () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_MARKET,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      persist: true,
    };
    useDealTicketFormValues.setState({
      formValues: {
        [expectedOrder.marketId]: {
          [DealTicketType.Market]: expectedOrder,
        },
      },
    });
    const user = userEvent.setup();
    render(generateJsx(mocks));
    await user.click(screen.getByTestId('order-type-Market'));
    await user.hover(screen.getByText('Reduce only'));
    // 7003-SORD-058
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      /"Reduce only" will ensure/
    );
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

    render(generateJsx(mocks));

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeEnabled();
    expect(screen.queryByTestId('reduce-only')).not.toBeInTheDocument();
    expect(screen.getByTestId('post-only')).toBeChecked();
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

    render(generateJsx(mocks));

    // Assert correct defaults are used from store
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.queryByTestId('post-only')).not.toBeInTheDocument();
    expect(screen.queryByTestId('iceberg')).not.toBeInTheDocument();
    expect(screen.getByTestId('reduce-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).not.toBeChecked();
  });

  it('handles TIF select box dependent on order type', async () => {
    const user = userEvent.setup();

    render(generateJsx(mocks));

    await user.click(screen.getByTestId('order-type-Market'));

    expect(screen.getByTestId('order-type-Market').dataset.state).toEqual('on');
    // Only FOK and IOC should be present for type market order
    // 7002-SORD-023
    // 7002-SORD-024
    // 7002-SORD-025
    // 7002-SORD-026
    // 7002-SORD-027
    // 7002-SORD-028
    expect(
      Array.from(
        (screen.getByTestId('order-tif').nextSibling as HTMLSelectElement)
          .children
      ).map((o) => o.textContent)
    ).toEqual([
      Schema.OrderTimeInForceMapping[Schema.OrderTimeInForce.TIME_IN_FORCE_FOK],
      Schema.OrderTimeInForceMapping[Schema.OrderTimeInForce.TIME_IN_FORCE_IOC],
    ]);

    // IOC should be default
    // 7002-SORD-030
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Select FOK - FOK should be selected
    await selectTIF(/FOK/);
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Switch to type limit order -> all TIF options should be shown
    // 7002-SORD-023
    // 7002-SORD-024
    // 7002-SORD-025
    // 7002-SORD-026
    // 7002-SORD-027
    // 7002-SORD-028
    await user.click(screen.getByTestId('order-type-Limit'));
    expect(
      Array.from(
        (screen.getByTestId('order-tif').nextSibling as HTMLSelectElement)
          .children
      )
    ).toHaveLength(Object.keys(Schema.OrderTimeInForce).length);

    // expect GTC as LIMIT default
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Select GTT -> GTT should be selected
    await selectTIF(/GTT/);
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Switch back to type market order -> FOK should be preserved from previous selection
    await user.click(screen.getByTestId('order-type-Market'));
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Select IOC -> IOC should be selected
    await selectTIF(/IOC/);
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch back type limit order -> GTT should be preserved
    await user.click(screen.getByTestId('order-type-Limit'));
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Select GFN -> GFN should be selected
    await selectTIF(/GFN/);
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFN
    );

    // Switch to type market order -> IOC should be preserved
    await user.click(screen.getByTestId('order-type-Market'));
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
  });

  it('can edit deal ticket', async () => {
    const user = userEvent.setup();
    // 7002-SORD-004
    // 7002-SORD-005
    // 7002-SORD-006
    // 7002-SORD-007
    render(generateJsx(mocks));

    // BUY is selected by default
    expect(screen.getByTestId('order-side-SIDE_BUY').dataset.state).toEqual(
      'checked'
    );

    await user.type(screen.getByTestId('order-size'), '200');

    expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

    await selectTIF(/IOC/);
    expect(screen.getByTestId('order-tif').nextSibling).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to limit order
    await user.click(screen.getByTestId('order-type-Limit'));
    expect(screen.getByTestId('order-type-Limit').dataset.state).toEqual('on');

    // Check all TIF options shown
    expect(
      Array.from(
        (screen.getByTestId('order-tif').nextSibling as HTMLSelectElement)
          .children
      )
    ).toHaveLength(Object.keys(Schema.OrderTimeInForce).length);
    // Switch to market order
    await user.click(screen.getByTestId('order-type-Market'));
    expect(screen.getByTestId('order-type-Market').dataset.state).toEqual('on');

    // Switch to short order
    await user.click(screen.getByTestId('order-side-SIDE_SELL'));
    expect(screen.getByTestId('order-side-SIDE_SELL').dataset.state).toEqual(
      'checked'
    );

    // Switch to long order
    await user.click(screen.getByTestId('order-side-SIDE_BUY'));
    expect(screen.getByTestId('order-side-SIDE_BUY').dataset.state).toEqual(
      'checked'
    );
  });

  it('validates size field', async () => {
    const user = userEvent.setup();
    render(generateJsx(mocks));
    const sizeErrorMessage = 'deal-ticket-error-message-size';
    const sizeInput = 'order-size';
    await user.click(screen.getByTestId('place-order'));
    // default value should be invalid
    expect(screen.getByTestId(sizeErrorMessage)).toBeInTheDocument();
    // to small value should be invalid
    await user.type(screen.getByTestId(sizeInput), '0.01');
    expect(screen.getByTestId(sizeErrorMessage)).toBeInTheDocument();

    // clear and fill using valid value
    await user.clear(screen.getByTestId(sizeInput));
    await user.type(screen.getByTestId(sizeInput), '0.1');
    expect(screen.queryByTestId(sizeErrorMessage)).toBeNull();
  });

  it('validates price field', async () => {
    const user = userEvent.setup();
    const priceErrorMessage = 'deal-ticket-error-message-price';
    const priceInput = 'order-price';
    const submitButton = 'place-order';
    const orderTypeMarket = 'order-type-Market';
    const orderTypeLimit = 'order-type-Limit';
    render(generateJsx(mocks));

    await user.click(screen.getByTestId(submitButton));

    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();
    await user.type(screen.getByTestId(priceInput), '0.001');
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // switch to market order type error should disappear
    await user.click(screen.getByTestId(orderTypeMarket));
    await user.click(screen.getByTestId(submitButton));
    expect(screen.queryByTestId(priceErrorMessage)).toBeNull();

    // switch back to limit type
    await user.click(screen.getByTestId(orderTypeLimit));
    await user.click(screen.getByTestId(submitButton));
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // to small value should be invalid
    await user.type(screen.getByTestId(priceInput), '0.001');
    expect(screen.getByTestId(priceErrorMessage)).toBeInTheDocument();

    // clear and fill using valid value
    await user.clear(screen.getByTestId(priceInput));
    await user.type(screen.getByTestId(priceInput), '0.01');
    expect(screen.queryByTestId(priceErrorMessage)).toBeNull();
  });

  it('validates size when positionDecimalPlaces is negative', async () => {
    const user = userEvent.setup();
    render(generateJsx(mocks, { positionDecimalPlaces: -4 }));
    const sizeErrorMessage = 'deal-ticket-error-message-size';
    const sizeInput = 'order-size';

    await user.type(screen.getByTestId(sizeInput), '10');

    await user.click(screen.getByTestId('place-order'));
    // default value should be invalid
    expect(screen.getByTestId(sizeErrorMessage)).toBeInTheDocument();
    expect(screen.getByTestId(sizeErrorMessage)).toHaveTextContent(
      'Size cannot be lower than 10000'
    );
    await user.type(screen.getByTestId(sizeInput), '10001');
    expect(screen.getByTestId(sizeErrorMessage)).toHaveTextContent(
      'Size must be a multiple of 10000 for this market'
    );
    await user.clear(screen.getByTestId(sizeInput));
    await user.type(screen.getByTestId(sizeInput), '10000');
    expect(screen.queryByTestId(sizeErrorMessage)).toBeNull();
  });

  it('validates iceberg field', async () => {
    const user = userEvent.setup();
    const peakSizeErrorMessage = 'deal-ticket-peak-error-message';
    const minimumSizeErrorMessage = 'deal-ticket-minimum-error-message';
    const sizeInput = 'order-size';
    const peakSizeInput = 'order-peak-size';
    const minimumSizeInput = 'order-minimum-size';
    const submitButton = 'place-order';

    render(generateJsx(mocks));
    await selectTIF(/GFA/);
    await user.click(screen.getByTestId('iceberg'));
    await user.click(screen.getByTestId(submitButton));

    // validate empty fields, minimumSizeErrorMessage won't show unless
    // peakSize is valid, so as to only show one at a time
    expect(screen.getByTestId(peakSizeErrorMessage)).toBeInTheDocument();
    expect(screen.queryByTestId(minimumSizeErrorMessage)).toBeNull();

    await user.type(screen.getByTestId(peakSizeInput), '1');
    await user.type(screen.getByTestId('order-size'), '1');
    await user.click(screen.getByTestId(submitButton));

    expect(screen.queryByTestId(peakSizeErrorMessage)).toBeNull();
    expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await user.type(screen.getByTestId(peakSizeInput), '0.01');
    await user.type(screen.getByTestId(minimumSizeInput), '0.01');

    // validate value smaller than step
    expect(screen.getByTestId(peakSizeErrorMessage)).toBeInTheDocument();
    // expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await user.clear(screen.getByTestId(peakSizeInput));
    await user.type(screen.getByTestId(peakSizeInput), '0.5');
    await user.clear(screen.getByTestId(minimumSizeInput));
    await user.type(screen.getByTestId(minimumSizeInput), '0.7');

    await user.clear(screen.getByTestId(sizeInput));
    await user.type(screen.getByTestId(sizeInput), '0.1');

    // validate value higher than size
    expect(screen.getByTestId(peakSizeErrorMessage)).toBeInTheDocument();
    // expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await user.clear(screen.getByTestId(sizeInput));
    await user.type(screen.getByTestId(sizeInput), '1');
    // validate peak higher than minimum
    expect(screen.queryByTestId(peakSizeErrorMessage)).toBeNull();
    // expect(screen.getByTestId(minimumSizeErrorMessage)).toBeInTheDocument();

    await user.clear(screen.getByTestId(peakSizeInput));
    await user.type(screen.getByTestId(peakSizeInput), '1');
    await user.clear(screen.getByTestId(minimumSizeInput));
    await user.type(screen.getByTestId(minimumSizeInput), '1');

    // validate correct values
    expect(screen.queryByTestId(peakSizeErrorMessage)).toBeNull();
    expect(screen.queryByTestId(minimumSizeErrorMessage)).toBeNull();
  });

  it('sets expiry time/date to now if expiry is changed to checked', async () => {
    const datePicker = 'date-picker-field';
    const now = 24 * 60 * 60 * 1000;
    render(generateJsx(mocks));
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    await selectTIF(/GTT/);

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
    await selectTIF(/GFA/);
    await selectTIF(/GTT/);
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
      const marketDataOverrides = { marketState: marketState };
      render(generateJsx(mocks, {}, marketDataOverrides));

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
    const user = userEvent.setup();

    // 7002-SORD-059
    // Render component
    render(generateJsx(mocks));

    // Elements
    const toggleLimit = screen.getByTestId('order-type-Limit');
    const orderSizeField = screen.getByTestId('order-price');
    const orderPriceField = screen.getByTestId('order-price');
    const placeOrderBtn = screen.getByTestId('place-order');

    // Actions
    await user.click(toggleLimit);
    await selectTIF(/GTC/);
    await user.clear(orderSizeField);
    await user.type(orderSizeField, '1');
    await user.clear(orderPriceField);
    await user.type(orderPriceField, '1.123456');
    await user.click(placeOrderBtn);

    // Expectations
    const errorMessage = await screen.findByTestId(
      'deal-ticket-error-message-price'
    );
    expect(errorMessage).toHaveTextContent(
      'Price must be a multiple of 0.01 for this market'
    );
  });

  it('must see warning when placing an order with expiry date in past', async () => {
    const user = userEvent.setup();

    // Render component
    render(generateJsx(mocks));

    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    // Elements
    const toggleLimit = screen.getByTestId('order-type-Limit');
    const orderPriceField = screen.getByTestId('order-price');
    const orderSizeField = screen.getByTestId('order-price');
    const datePicker = 'date-picker-field';
    const placeOrderBtn = screen.getByTestId('place-order');

    // Actions
    await user.click(toggleLimit);
    await user.clear(orderPriceField);
    await user.type(orderPriceField, '0.1');
    await user.clear(orderSizeField);
    await user.type(orderSizeField, '1');

    await selectTIF(/GTT/);

    // Set date to past
    const expiresAt = new Date(now - 24 * 60 * 60 * 1000);
    const expiresAtInputValue = formatForInput(expiresAt);

    fireEvent.change(screen.getByTestId(datePicker), {
      target: { value: expiresAtInputValue },
    });

    // Place order
    await user.click(placeOrderBtn);

    // Expectations
    const errorMessage = screen.getByTestId('deal-ticket-error-message-expiry');
    expect(errorMessage).toHaveTextContent(
      'The expiry date that you have entered appears to be in the past'
    );
  });

  it('toggle of size between base and quote asset', async () => {
    const user = userEvent.setup();
    // Render component
    render(generateJsx(mocks));

    let orderSizeField = screen.getByTestId('order-size');
    await user.type(orderSizeField, '1');
    await user.click(screen.getByTestId('useNotional'));
    let orderNotionalField = screen.getByTestId('order-notional');
    // market price is 2 order size is 1 => notional is 2
    expect(orderNotionalField).toHaveDisplayValue('2.0');

    await user.clear(orderNotionalField);
    await user.type(orderNotionalField, '4');
    await user.click(screen.getByTestId('useSize'));
    orderSizeField = screen.getByTestId('order-size');
    // market price is 2 notional is 4  => size is 2
    expect(orderSizeField).toHaveDisplayValue('2.0');

    await user.click(screen.getByTestId('order-type-Limit'));
    const orderPriceField = screen.getByTestId('order-price');
    await user.clear(orderPriceField);
    await user.type(orderPriceField, '4');
    await user.click(screen.getByTestId('useNotional'));
    // limit price is 4 size is 2 => notional 8
    orderNotionalField = screen.getByTestId('order-notional');
    expect(screen.getByTestId('order-notional')).toHaveDisplayValue('8.0');

    await user.clear(orderNotionalField);
    await user.type(orderNotionalField, '16');
    await user.click(screen.getByTestId('useSize'));
    orderSizeField = screen.getByTestId('order-size');
    // market price is 4 notional is 16  => size is 4
    expect(orderSizeField).toHaveDisplayValue('4.0');
  });
});
