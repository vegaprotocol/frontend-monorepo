import { render } from '@testing-library/react';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import type { VegaStoredTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { VegaTransactionDetails } from './use-vega-transaction-toasts';

jest.mock('@vegaprotocol/assets', () => {
  const A1 = {
    decimals: 2,
    id: 'asset-1',
    name: 'A1',
    quantum: '10',
    symbol: '$A',
  };
  return {
    ...jest.requireActual('@vegaprotocol/assets'),
    useAssetsDataProvider: jest.fn(() => ({ data: [A1] })),
  };
});

jest.mock('@vegaprotocol/market-list', () => {
  const M1 = {
    id: 'market-1',
    decimalPlaces: 2,
    positionDecimalPlaces: 2,
    tradableInstrument: {
      instrument: {
        id: 'M1',
        name: 'M1',
        code: 'M1',
        product: {
          quoteName: '',
          settlementAsset: {
            id: 'asset-1',
            symbol: '$A',
            decimals: 2,
          },
        },
      },
    },
  };
  return {
    ...jest.requireActual('@vegaprotocol/market-list'),
    useMarketList: jest.fn(() => ({ data: [M1] })),
  };
});

const unsupportedTransaction: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: { delegateSubmission: { nodeId: '1', amount: '0' } },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

const withdraw: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    withdrawSubmission: {
      amount: '1234',
      asset: 'asset-1',
      ext: { erc20: { receiverAddress: '0x0' } },
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

const submitOrder: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    orderSubmission: {
      marketId: 'market-1',
      side: Side.SIDE_BUY,
      size: '10',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      type: OrderType.TYPE_MARKET,
      price: '1234',
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
  order: {
    id: '0',
    side: Side.SIDE_BUY,
    size: '10',
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    type: OrderType.TYPE_MARKET,
    price: '1234',
    createdAt: new Date(),
    market: {
      id: 'market-1',
      decimalPlaces: 2,
      positionDecimalPlaces: 2,
      tradableInstrument: {
        instrument: {
          code: 'M1',
          name: 'M1',
          product: {
            settlementAsset: {
              decimals: 2,
              symbol: '$A',
            },
          },
        },
      },
    },
    status: OrderStatus.STATUS_ACTIVE,
  },
};

const editOrder: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    orderAmendment: {
      marketId: 'market-1',
      orderId: 'order-1',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
  order: {
    id: '0',
    side: Side.SIDE_BUY,
    size: '10',
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    type: OrderType.TYPE_MARKET,
    price: '1234',
    createdAt: new Date(),
    market: {
      id: 'market-1',
      decimalPlaces: 2,
      positionDecimalPlaces: 2,
      tradableInstrument: {
        instrument: {
          code: 'M1',
          name: 'M1',
          product: {
            settlementAsset: {
              decimals: 2,
              symbol: '$A',
            },
          },
        },
      },
    },
    status: OrderStatus.STATUS_ACTIVE,
  },
};

const cancelOrder: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    orderCancellation: {
      marketId: 'market-1',
      orderId: 'order-1',
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
  order: {
    id: '0',
    side: Side.SIDE_SELL,
    size: '666',
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    type: OrderType.TYPE_MARKET,
    price: '1234',
    createdAt: new Date(),
    market: {
      id: 'market-1',
      decimalPlaces: 2,
      positionDecimalPlaces: 2,
      tradableInstrument: {
        instrument: {
          code: 'M1',
          name: 'M1',
          product: {
            settlementAsset: {
              decimals: 2,
              symbol: '$A',
            },
          },
        },
      },
    },
    status: OrderStatus.STATUS_ACTIVE,
  },
};

const cancelAll: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    orderCancellation: {
      marketId: undefined,
      orderId: undefined,
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

const closePosition: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    batchMarketInstructions: {
      cancellations: [{ marketId: 'market-1', orderId: '' }],
      submissions: [
        {
          marketId: 'market-1',
          side: Side.SIDE_BUY,
          size: '10',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
          type: OrderType.TYPE_MARKET,
          price: '1234',
        },
      ],
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

const batch: VegaStoredTxState = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: {
    batchMarketInstructions: {
      submissions: [
        {
          marketId: 'market-1',
          side: Side.SIDE_BUY,
          size: '10',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
          type: OrderType.TYPE_MARKET,
          price: '1234',
        },
      ],
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

describe('VegaTransactionDetails', () => {
  it('does not display details if tx type cannot be determined', () => {
    const { queryByTestId } = render(
      <VegaTransactionDetails tx={unsupportedTransaction} />
    );
    expect(queryByTestId('vega-tx-details')).toBeNull();
  });
  it.each([
    { tx: withdraw, details: 'Withdraw 12.34 $A' },
    { tx: submitOrder, details: 'Order +0.10 @ 12.34 $A' },
    { tx: editOrder, details: 'Edit order +0.10 @ 12.34 $A' },
    { tx: cancelOrder, details: 'Cancel order -6.66 @ 12.34 $A' },
    { tx: cancelAll, details: 'Cancel all orders' },
    { tx: closePosition, details: 'Close position for M1' },
    { tx: batch, details: 'Batch market instruction' },
  ])('display details for transaction', ({ tx, details }) => {
    const { queryByTestId } = render(<VegaTransactionDetails tx={tx} />);
    expect(queryByTestId('vega-tx-details')?.textContent).toEqual(details);
  });
});
