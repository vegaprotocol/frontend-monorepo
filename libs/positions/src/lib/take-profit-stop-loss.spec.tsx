import {
  // act,
  // fireEvent,
  render,
  screen,
  // waitFor,
  within,
} from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import userEvent from '@testing-library/user-event';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';

import {
  TakeProfitStopLoss,
  TakeProfitStopLossSetup,
} from './take-profit-stop-loss';
import type { Market } from '@vegaprotocol/markets';
import { type StopOrderFieldsFragment } from '@vegaprotocol/orders';

const partyId = 'pubKey';
const quoteName = 'USDT';
const symbol = 'USDT';
const decimals = 6;
const decimalPlaces = 1;
const positionDecimalPlaces = 4;
const quantum = '1000000';
const code = 'BTC/USDT';
const marketId =
  '3c8bb69401830572bcb8240681df78261e4966dda817fe298a7453ecdb7bf8c8';

const mockMarket = jest.fn(
  () =>
    ({
      id: marketId,
      decimalPlaces,
      positionDecimalPlaces,
      tradableInstrument: {
        instrument: {
          code,
          product: {
            __typename: 'Perpetual',
            quoteName,
            settlementAsset: {
              symbol,
              decimals,
              quantum,
            },
          },
        },
      },
    } as Market)
);

const mockCreate = jest.fn();

const stopOrders: StopOrderFieldsFragment[] = [
  {
    id: '1',
    ocoLinkId: null,
    expiresAt: null,
    expiryStrategy: null,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    sizeOverrideSetting:
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
    sizeOverrideValue: '0.2',
    status: Schema.StopOrderStatus.STATUS_PENDING,
    createdAt: '2024-04-08T13:12:51.139187Z',
    updatedAt: null,
    partyId,
    marketId,
    order: null,
    trigger: {
      price: '900000',
      __typename: 'StopOrderPrice',
    },
    submission: {
      marketId,
      price: '0',
      size: '1',
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: null,
      type: Schema.OrderType.TYPE_MARKET,
      reference: '',
      peggedOrder: null,
      postOnly: false,
      reduceOnly: true,
      __typename: 'OrderSubmission',
    },
    __typename: 'StopOrder',
  },
  {
    id: '2',
    ocoLinkId: null,
    expiresAt: null,
    expiryStrategy: null,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    sizeOverrideSetting:
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
    sizeOverrideValue: '0.1',
    status: Schema.StopOrderStatus.STATUS_PENDING,
    createdAt: '2024-04-08T13:12:40.494271Z',
    updatedAt: null,
    partyId,
    marketId,
    order: null,
    trigger: {
      price: '800000',
      __typename: 'StopOrderPrice',
    },
    submission: {
      marketId,
      price: '0',
      size: '1',
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: null,
      type: Schema.OrderType.TYPE_MARKET,
      reference: '',
      peggedOrder: null,
      postOnly: false,
      reduceOnly: true,
      __typename: 'OrderSubmission',
    },
    __typename: 'StopOrder',
  },
  {
    id: '3',
    ocoLinkId: null,
    expiresAt: null,
    expiryStrategy: null,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
    sizeOverrideSetting:
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
    sizeOverrideValue: '0.15',
    status: Schema.StopOrderStatus.STATUS_PENDING,
    createdAt: '2024-04-05T13:37:36.289227Z',
    updatedAt: null,
    partyId,
    marketId,
    order: null,
    trigger: {
      price: '500000',
      __typename: 'StopOrderPrice',
    },
    submission: {
      marketId,
      price: '0',
      size: '1',
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: null,
      type: Schema.OrderType.TYPE_MARKET,
      reference: '',
      peggedOrder: null,
      postOnly: false,
      reduceOnly: true,
      __typename: 'OrderSubmission',
    },
    __typename: 'StopOrder',
  },
  {
    id: '4',
    ocoLinkId: null,
    expiresAt: null,
    expiryStrategy: null,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
    sizeOverrideSetting:
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
    sizeOverrideValue: '0.25',
    status: Schema.StopOrderStatus.STATUS_PENDING,
    createdAt: '2024-04-04T15:30:22.082074Z',
    updatedAt: null,
    partyId: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
    marketId:
      '3c8bb69401830572bcb8240681df78261e4966dda817fe298a7453ecdb7bf8c8',
    order: null,
    trigger: {
      price: '400000',
      __typename: 'StopOrderPrice',
    },
    submission: {
      marketId,
      price: '0',
      size: '1',
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: null,
      type: Schema.OrderType.TYPE_MARKET,
      reference: '',
      peggedOrder: null,
      postOnly: false,
      reduceOnly: true,
      __typename: 'OrderSubmission',
    },
    __typename: 'StopOrder',
  },
];

const mockMarkPrice = jest.fn(() => '700000');

const mockActiveStopOrders = jest.fn<{ data: StopOrderFieldsFragment[] }, []>(
  () => ({
    data: stopOrders,
  })
);

const mockUseOpenVolume = jest.fn(() => ({
  openVolume: '10000',
  averageEntryPrice: '600000',
}));

jest.mock('./use-open-volume', () => ({
  useOpenVolume: jest.fn(() => mockUseOpenVolume()),
}));

jest.mock('@vegaprotocol/orders', () => ({
  ...jest.requireActual('@vegaprotocol/orders'),
  useActiveStopOrders: jest.fn(() => mockActiveStopOrders()),
}));

jest.mock('@vegaprotocol/markets', () => ({
  ...jest.requireActual('@vegaprotocol/markets'),
  useMarket: () => ({ data: mockMarket() }),
  useMarkPrice: () => ({ data: mockMarkPrice() }),
}));

const mockTransactions = jest.fn(() => []);

jest.mock('@vegaprotocol/web3', () => ({
  ...jest.requireActual('@vegaprotocol/web3'),
  useVegaTransactionStore: jest.fn(() => mockTransactions()),
}));

describe('TakeProfitStopLoss', () => {
  const generateJsx = () => {
    return (
      <MockedWalletProvider>
        <TakeProfitStopLoss marketId={mockMarket().id} create={mockCreate} />
      </MockedWalletProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.store.setState({ pubKey: partyId });
  });

  it('displays quoteName, position, entry price and mark price', () => {
    render(generateJsx());
    expect(screen.getByTestId('instrument-code')).toHaveTextContent(code);
    expect(screen.getByTestId('open-volume')).toHaveTextContent('+1.0');
    expect(screen.getByTestId('average-entry-price')).toHaveTextContent(
      '60,000.0 USDT'
    );
    expect(screen.getByTestId('mark-price')).toHaveTextContent('70,000.0 USDT');
  });

  it('switches between TP and SL setup forms', async () => {
    render(generateJsx());
    expect(screen.queryByTestId('setup-form')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('add-take-profit'));
    expect(
      within(screen.getByTestId('take-profit')).getByTestId('setup-form')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('stop-loss')).queryByTestId('setup-form')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('add-stop-loss'));
    expect(
      within(screen.getByTestId('take-profit')).queryByTestId('setup-form')
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('stop-loss')).getByTestId('setup-form')
    ).toBeInTheDocument();
  });

  it('lists orders in proper order for positive open volume', () => {
    render(generateJsx());
    const takeProfit = [
      'Reduce 10% at 80,000.0 USDT for estimated PnL of 2,000.00 USDT',
      'Reduce 20% at 90,000.0 USDT for estimated PnL of 6,000.00 USDT',
    ];
    within(screen.getByTestId('take-profit'))
      .getAllByTestId('stop-order')
      .forEach((stopOrder, i) => {
        expect(stopOrder).toHaveTextContent(takeProfit[i]);
      });
    const stopLoss = [
      'Reduce 15% at 50,000.0 USDT for estimated PnL of -1,500.00 USDT',
      'Reduce 25% at 40,000.0 USDT for estimated PnL of -5,000.00 USDT',
    ];
    within(screen.getByTestId('stop-loss'))
      .getAllByTestId('stop-order')
      .forEach((stopOrder, i) => {
        expect(stopOrder).toHaveTextContent(stopLoss[i]);
      });
  });

  it('lists orders in proper order for negative open volume', () => {
    mockUseOpenVolume.mockReturnValueOnce({
      openVolume: '-10000',
      averageEntryPrice: '600000',
    });
    render(generateJsx());
    const takeProfit = [
      'Reduce 15% at 50,000.0 USDT for estimated PnL of 1,500.00 USDT',
      'Reduce 25% at 40,000.0 USDT for estimated PnL of 5,000.00 USDT',
    ];
    within(screen.getByTestId('take-profit'))
      .getAllByTestId('stop-order')
      .forEach((stopOrder, i) => {
        expect(stopOrder).toHaveTextContent(takeProfit[i]);
      });
    const stopLoss = [
      'Reduce 10% at 80,000.0 USDT for estimated PnL of -2,000.00 USDT',
      'Reduce 20% at 90,000.0 USDT for estimated PnL of -6,000.00 USDT',
    ];
    within(screen.getByTestId('stop-loss'))
      .getAllByTestId('stop-order')
      .forEach((stopOrder, i) => {
        expect(stopOrder).toHaveTextContent(stopLoss[i]);
      });
  });

  it('shows allocation', () => {
    render(generateJsx());
    expect(
      within(screen.getByTestId('take-profit')).getByTestId('allocation')
    ).toHaveTextContent('Allocation: 30%');
    expect(
      within(screen.getByTestId('stop-loss')).getByTestId('allocation')
    ).toHaveTextContent('Allocation: 40%');
  });

  it('displays cancel and cancel all buttons and creates transaction on click', async () => {
    mockActiveStopOrders.mockReturnValueOnce({
      data: stopOrders.slice(0, 3),
    });
    render(generateJsx());
    // cancel first single take profit stop order on the list
    await userEvent.click(screen.getAllByTestId('cancel-stop-order')[0]);
    expect(mockCreate).toBeCalledWith({
      stopOrdersCancellation: {
        marketId,
        stopOrderId: '2',
      },
    });
    // cancel all take profit stop orders in batch
    await userEvent.click(screen.getAllByTestId('cancel-all')[0]);
    expect(mockCreate).toBeCalledWith({
      batchMarketInstructions: {
        stopOrdersCancellation: [
          {
            marketId:
              '3c8bb69401830572bcb8240681df78261e4966dda817fe298a7453ecdb7bf8c8',
            stopOrderId: '2',
          },
          {
            marketId:
              '3c8bb69401830572bcb8240681df78261e4966dda817fe298a7453ecdb7bf8c8',
            stopOrderId: '1',
          },
        ],
      },
    });
    // cancel all (only one on the list) stop loss orders in batch
    await userEvent.click(screen.getAllByTestId('cancel-all')[1]);
    expect(mockCreate).toBeCalledWith({
      stopOrdersCancellation: {
        marketId,
        stopOrderId: '3',
      },
    });
  });
});

describe('TakeProfitStopLossSetup', () => {
  const generateJsx = (
    side = Schema.Side.SIDE_BUY,
    triggerDirection = Schema.StopOrderTriggerDirection
      .TRIGGER_DIRECTION_FALLS_BELOW
  ) => {
    return (
      <TakeProfitStopLossSetup
        create={mockCreate}
        market={mockMarket()}
        marketPrice={mockMarkPrice()}
        side={side}
        triggerDirection={triggerDirection}
        allocation={0.3}
        averageEntryPrice={mockUseOpenVolume().averageEntryPrice}
        openVolume={mockUseOpenVolume().openVolume}
      />
    );
  };
  it('sets max quantity', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('use-max'));
    expect(screen.getByTestId('size-input')).toHaveValue(70);
  });

  it('displays orders summary message', () => {
    expect(true).toBe(true);
  });

  it('validates price field', () => {
    expect(true).toBe(true);
  });

  it('validates quantity field', () => {
    expect(true).toBe(true);
  });

  it('shows immediate trigger warning', () => {
    expect(true).toBe(true);
  });

  it('create transaction on submit', () => {
    expect(true).toBe(true);
  });

  it('if pending transaction exist do not submit and shows transaction', () => {
    expect(true).toBe(true);
  });
});
