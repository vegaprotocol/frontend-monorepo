import { render, screen, within } from '@testing-library/react';
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
import { VegaStoredTxState, VegaTxStatus } from '@vegaprotocol/web3';
import {
  SizeOverrideSetting,
  type StopOrdersSubmissionBody,
} from '@vegaprotocol/wallet';

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

const generateStopOrder = ({
  id,
  triggerDirection,
  sizeOverrideValue,
  price,
  side,
}: {
  id: string;
  triggerDirection: Schema.StopOrderTriggerDirection;
  sizeOverrideValue: string;
  price: string;
  side: Schema.Side.SIDE_SELL;
}): StopOrderFieldsFragment => ({
  id,
  ocoLinkId: null,
  expiresAt: null,
  expiryStrategy: null,
  triggerDirection,
  sizeOverrideSetting:
    Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
  sizeOverrideValue,
  status: Schema.StopOrderStatus.STATUS_PENDING,
  createdAt: '2024-04-08T13:12:51.139187Z',
  updatedAt: null,
  partyId,
  marketId,
  order: null,
  trigger: {
    price,
    __typename: 'StopOrderPrice',
  },
  submission: {
    marketId,
    price: '0',
    size: '1',
    side,
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
});

const stopOrders: StopOrderFieldsFragment[] = [
  generateStopOrder({
    id: '1',
    price: '900000',
    side: Schema.Side.SIDE_SELL,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    sizeOverrideValue: '0.2',
  }),
  generateStopOrder({
    id: '2',
    price: '800000',
    side: Schema.Side.SIDE_SELL,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    sizeOverrideValue: '0.1',
  }),
  generateStopOrder({
    id: '3',
    price: '500000',
    side: Schema.Side.SIDE_SELL,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
    sizeOverrideValue: '0.15',
  }),
  generateStopOrder({
    id: '4',
    price: '400000',
    side: Schema.Side.SIDE_SELL,
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
    sizeOverrideValue: '0.25',
  }),
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

const mockTransactions = jest.fn<(VegaStoredTxState | undefined)[], []>(
  () => []
);

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
            marketId,
            stopOrderId: '2',
          },
          {
            marketId,
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
    side = Schema.Side.SIDE_SELL,
    triggerDirection = Schema.StopOrderTriggerDirection
      .TRIGGER_DIRECTION_RISES_ABOVE
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets max quantity', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('use-max'));
    expect(screen.getByTestId('size-input')).toHaveValue(70);
  });

  it('displays orders summary message long position take profit', async () => {
    render(
      generateJsx(
        Schema.Side.SIDE_SELL,
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      )
    );
    await userEvent.type(screen.getByTestId('price-input'), '80000');
    await userEvent.type(screen.getByTestId('size-input'), '10');
    expect(screen.getByTestId('summary-message')).toHaveTextContent(
      'When the mark price rises above 80000 USDT it will trigger a Take Profit order to close 10% of this position for an estimated PNL of 2,000.00 USDT.'
    );
  });

  it('displays orders summary message long position stop loss', async () => {
    render(
      generateJsx(
        Schema.Side.SIDE_SELL,
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      )
    );
    await userEvent.type(screen.getByTestId('price-input'), '55000');
    await userEvent.type(screen.getByTestId('size-input'), '5');
    expect(screen.getByTestId('summary-message')).toHaveTextContent(
      'When the mark price falls below 55000 USDT it will trigger a Stop Loss order to close 5% of this position with an estimated PNL of -250.00 USDT.'
    );
  });

  it('displays orders summary message short position take profit', async () => {
    mockUseOpenVolume.mockReturnValue({
      openVolume: '-10000',
      averageEntryPrice: '600000',
    });
    render(
      generateJsx(
        Schema.Side.SIDE_BUY,
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      )
    );
    await userEvent.type(screen.getByTestId('price-input'), '40000');
    await userEvent.type(screen.getByTestId('size-input'), '20');
    expect(screen.getByTestId('summary-message')).toHaveTextContent(
      'When the mark price falls below 40000 USDT it will trigger a Take Profit order to close 20% of this position for an estimated PNL of 4,000.00 USDT.'
    );
  });

  it('displays orders summary message short position stop loss', async () => {
    mockUseOpenVolume.mockReturnValue({
      openVolume: '-10000',
      averageEntryPrice: '600000',
    });
    render(
      generateJsx(
        Schema.Side.SIDE_BUY,
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      )
    );
    await userEvent.type(screen.getByTestId('price-input'), '70000');
    await userEvent.type(screen.getByTestId('size-input'), '20');
    expect(screen.getByTestId('summary-message')).toHaveTextContent(
      'When the mark price rises above 70000 USDT it will trigger a Stop Loss order to close 20% of this position with an estimated PNL of -2,000.00 USDT.'
    );
  });

  it('validates quantity field', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('size-error-message')).toHaveTextContent(
      'You need to provide a quantity'
    );
    await userEvent.type(screen.getByTestId('size-input'), '100');
    expect(screen.getByTestId('size-error-message')).toHaveTextContent(
      'Quantity cannot be greater than 70'
    );
    await userEvent.clear(screen.getByTestId('size-input'));
    await userEvent.type(screen.getByTestId('size-input'), '0.1');
    expect(screen.getByTestId('size-error-message')).toHaveTextContent(
      'Quantity cannot be lower than 1'
    );
    await userEvent.clear(screen.getByTestId('size-input'));
    await userEvent.type(screen.getByTestId('size-input'), '1.1');
    expect(screen.getByTestId('size-error-message')).toHaveTextContent(
      'Quantity must be whole numbers'
    );
  });

  it('validates price field', async () => {
    render(generateJsx());
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('price-error-message')).toHaveTextContent(
      'You need to provide a price'
    );
    await userEvent.clear(screen.getByTestId('price-input'));
    await userEvent.type(screen.getByTestId('price-input'), '0.01');
    expect(screen.getByTestId('price-error-message')).toHaveTextContent(
      'Price cannot be lower than 0.1'
    );
    await userEvent.clear(screen.getByTestId('price-input'));
    await userEvent.type(screen.getByTestId('price-input'), '1.01');
    expect(screen.getByTestId('price-error-message')).toHaveTextContent(
      'Price must be a multiple of 0.1 for this market'
    );
  });

  it('shows immediate trigger warning', async () => {
    const result = render(generateJsx());
    await userEvent.click(screen.getByTestId('submit'));
    await userEvent.type(screen.getByTestId('price-input'), '69999');
    expect(
      screen.getByTestId('price-trigger-warning-message')
    ).toBeInTheDocument();
    result.rerender(
      generateJsx(
        Schema.Side.SIDE_BUY,
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      )
    );
    await userEvent.type(screen.getByTestId('price-input'), '70001');
    expect(
      screen.getByTestId('price-trigger-warning-message')
    ).toBeInTheDocument();
  });

  it('create transaction on submit', async () => {
    render(generateJsx());
    await userEvent.type(screen.getByTestId('price-input'), '80000');
    await userEvent.type(screen.getByTestId('size-input'), '10');
    await userEvent.click(screen.getByTestId('submit'));
    expect(mockCreate).toHaveBeenLastCalledWith({
      stopOrdersSubmission: {
        fallsBelow: undefined,
        risesAbove: {
          orderSubmission: {
            marketId,
            reduceOnly: true,
            side: 'SIDE_SELL',
            size: '1',
            timeInForce: 'TIME_IN_FORCE_FOK',
            type: 'TYPE_MARKET',
          },
          price: '800000',
          sizeOverrideSetting:
            SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
          sizeOverrideValue: {
            percentage: '0.1',
          },
        },
      },
    });
  });

  it('if pending transaction exist do not submit and shows transaction', async () => {
    const transaction = {
      body: {
        stopOrdersSubmission: {
          risesAbove: {
            sizeOverrideSetting:
              SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
            orderSubmission: {
              marketId,
              side: Schema.Side.SIDE_SELL,
            },
          },
        },
      } as StopOrdersSubmissionBody,
      status: VegaTxStatus.Requested,
    } as VegaStoredTxState;

    mockTransactions.mockReturnValue([transaction]);
    const result = render(generateJsx());
    expect(screen.getByTestId('submit')).toHaveTextContent('Action required');

    transaction.status = VegaTxStatus.Pending;
    result.rerender(generateJsx());
    expect(screen.getByTestId('submit')).toHaveTextContent(
      'Awaiting confirmation'
    );

    await userEvent.type(screen.getByTestId('price-input'), '80000');
    await userEvent.type(screen.getByTestId('size-input'), '10');
    await userEvent.click(screen.getByTestId('submit'));
    expect(mockCreate).not.toBeCalled();

    transaction.status = VegaTxStatus.Complete;
    result.rerender(generateJsx());
    await userEvent.click(screen.getByTestId('submit'));
    expect(mockCreate).toBeCalled();
  });
});
