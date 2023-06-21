import { render } from '@testing-library/react';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import { vega as vegaProtos } from '@vegaprotocol/protos';
import type {
  Transaction,
  VegaStoredTxState,
  OrderSubmission,
} from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import {
  VegaTransactionDetails,
  getVegaTransactionContentIntent,
} from './use-vega-transaction-toasts';
import { Intent } from '@vegaprotocol/ui-toolkit';

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

jest.mock('@vegaprotocol/markets', () => {
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
    ...jest.requireActual('@vegaprotocol/markets'),
    useMarketList: jest.fn(() => ({ data: [M1] })),
  };
});

jest.mock('@vegaprotocol/orders', () => {
  return {
    ...jest.requireActual('@vegaprotocol/orders'),
    useOrderByIdQuery: jest.fn(({ variables: { orderId } }) => {
      if (orderId === '0') {
        return {
          data: {
            orderByID: {
              id: '0',
              side: 'SIDE_BUY',
              size: '10',
              timeInForce: 'TIME_IN_FORCE_FOK',
              type: 'TYPE_MARKET',
              price: '1234',
              createdAt: new Date(),
              status: 'STATUS_ACTIVE',
              market: { id: 'market-1' },
            },
          },
        };
      } else {
        return { data: undefined };
      }
    }),
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
      side: vegaProtos.Side.SIDE_BUY,
      size: BigInt(10),
      timeInForce: vegaProtos.Order.TimeInForce.TIME_IN_FORCE_FOK,
      type: vegaProtos.Order.Type.TYPE_MARKET,
      price: '1234',
      expiresAt: BigInt(0),
      postOnly: false,
      reduceOnly: false,
      peggedOrder: {
        offset: '',
        reference: vegaProtos.PeggedReference.PEGGED_REFERENCE_UNSPECIFIED,
      },
      reference: '',
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
    marketId: 'market-1',
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
      orderId: '0',
      timeInForce: vegaProtos.Order.TimeInForce.TIME_IN_FORCE_FOK,
      price: '1000',
      sizeDelta: BigInt(1),
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
    marketId: 'market-1',
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
      orderId: '0',
    },
  },
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
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
  } as Transaction,
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
          side: vegaProtos.Side.SIDE_BUY,
          size: BigInt(10),
          timeInForce: vegaProtos.Order.TimeInForce.TIME_IN_FORCE_FOK,
          type: vegaProtos.Order.Type.TYPE_MARKET,
          price: '1234',
        } as OrderSubmission,
      ],
    },
  } as Transaction,
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
          side: vegaProtos.Side.SIDE_BUY,
          size: BigInt(10),
          timeInForce: vegaProtos.Order.TimeInForce.TIME_IN_FORCE_FOK,
          type: vegaProtos.Order.Type.TYPE_MARKET,
          price: '1234',
        },
      ],
    },
  } as Transaction,
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
    expect(queryByTestId('toast-panel')).toBeNull();
  });
  it.each([
    { tx: withdraw, details: 'Withdraw 12.34 $A' },
    { tx: submitOrder, details: 'Submit order - activeM1+0.10 @ 12.34 $A' },
    {
      tx: editOrder,
      details: 'Edit order - activeM1+0.10 @ 12.34 $A+0.11 @ 10.00 $A',
    },
    { tx: cancelOrder, details: 'Cancel orderM1+0.10 @ 12.34 $A' },
    { tx: cancelAll, details: 'Cancel all orders' },
    { tx: closePosition, details: 'Close position for M1' },
    { tx: batch, details: 'Batch market instruction' },
  ])('display details for transaction', ({ tx, details }) => {
    const { queryByTestId } = render(<VegaTransactionDetails tx={tx} />);
    expect(queryByTestId('toast-panel')?.textContent).toEqual(details);
  });
});

describe('getVegaTransactionContentIntent', () => {
  it('returns the correct intent for a transaction', () => {
    expect(getVegaTransactionContentIntent(withdraw).intent).toBe(
      Intent.Primary
    );
    expect(getVegaTransactionContentIntent(submitOrder).intent).toBe(
      Intent.Success
    );
    expect(getVegaTransactionContentIntent(editOrder).intent).toBe(
      Intent.Primary
    );
    expect(getVegaTransactionContentIntent(cancelOrder).intent).toBe(
      Intent.Primary
    );
    expect(getVegaTransactionContentIntent(cancelAll).intent).toBe(
      Intent.Primary
    );
    expect(getVegaTransactionContentIntent(closePosition).intent).toBe(
      Intent.Primary
    );
    expect(getVegaTransactionContentIntent(batch).intent).toBe(Intent.Primary);
  });
});
