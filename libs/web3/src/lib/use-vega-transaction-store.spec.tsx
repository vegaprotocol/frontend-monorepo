import { useVegaTransactionStore } from './use-vega-transaction-store';
import type { VegaStoredTxState } from './use-vega-transaction-store';
import type {
  BatchMarketInstructionSubmissionBody,
  OrderAmendmentBody,
  OrderCancellationBody,
  WithdrawSubmissionBody,
} from '@vegaprotocol/wallet';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import { VegaTxStatus } from './types';
import { HALFMAXGOINT64 } from '@vegaprotocol/utils';

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  determineId: jest.fn((v) => v),
}));

describe('useVegaTransactionStore', () => {
  const orderCancellation: OrderCancellationBody = { orderCancellation: {} };
  const withdrawSubmission: WithdrawSubmissionBody = {
    withdrawSubmission: {
      amount: 'amount',
      asset: 'asset',
      ext: {
        erc20: {
          receiverAddress: 'receiverAddress',
        },
      },
    },
  };

  const marketId =
    '3aa2a828687cc3d59e92445d294891cbbd40e2165bbfb15674158ef5d4e8848d';
  const orderId =
    '6a4fcd0ba478df2f284ef5f6d3c64a478cb8043d3afe36f66f92c0ed92631e64';

  const orderAmendment: OrderAmendmentBody = {
    orderAmendment: {
      orderId,
      marketId,
      price: '1122',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      sizeDelta: 0,
    },
  };

  const closePosition: BatchMarketInstructionSubmissionBody = {
    batchMarketInstructions: {
      cancellations: [
        {
          marketId,
          orderId: '',
        },
      ],
      submissions: [
        {
          marketId: marketId,
          type: OrderType.TYPE_MARKET as const,
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC as const,
          side: Side.SIDE_SELL,
          size: HALFMAXGOINT64, // improvement for avoiding leftovers filled in the meantime when close request has been sent
          reduceOnly: true,
        },
      ],
    },
  };

  const order = {
    type: OrderType.TYPE_LIMIT,
    id: '6902dea1fa01f0b98cceb382cb9c95df244747fa27ba591de084cdd876d2f7c2',
    status: OrderStatus.STATUS_ACTIVE,
    createdAt: '2023-03-01T14:08:13.48478Z',
    size: '12',
    price: '1125',
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
    expiresAt: null,
    side: Side.SIDE_BUY,
    marketId,
    remaining: '12',
  };

  const processedTransactionUpdate = {
    status: VegaTxStatus.Pending,
    txHash: 'txHash',
    signature: 'signature',
  };
  const transactionResult = {
    hash: processedTransactionUpdate.txHash,
  } as unknown as NonNullable<VegaStoredTxState['transactionResult']>;
  const withdrawal = {
    id: 'signature',
  } as unknown as NonNullable<VegaStoredTxState['withdrawal']>;
  const withdrawalApproval = {} as unknown as NonNullable<
    VegaStoredTxState['withdrawalApproval']
  >;
  it('creates transaction with default values', () => {
    useVegaTransactionStore.getState().create(orderCancellation);
    const transaction = useVegaTransactionStore.getState().transactions[0];
    expect(transaction?.createdAt).toBeTruthy();
    expect(transaction?.status).toEqual(VegaTxStatus.Requested);
    expect(transaction?.body).toEqual(orderCancellation);
    expect(transaction?.dialogOpen).toEqual(true);
  });
  it('updates transaction by index/id', () => {
    useVegaTransactionStore.getState().create(orderCancellation);
    useVegaTransactionStore.getState().create(orderCancellation);
    useVegaTransactionStore.getState().create(orderCancellation);
    const transaction = useVegaTransactionStore.getState().transactions[1];
    useVegaTransactionStore
      .getState()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .update(transaction!.id, { status: VegaTxStatus.Pending });
    expect(
      useVegaTransactionStore.getState().transactions.map((t) => t?.status)
    ).toEqual([
      VegaTxStatus.Requested,
      VegaTxStatus.Pending,
      VegaTxStatus.Requested,
    ]);
  });

  it('updates an order with order amendment', () => {
    useVegaTransactionStore.getState().create(orderAmendment, { order });
    useVegaTransactionStore.getState().create(orderAmendment, { order });
    useVegaTransactionStore.getState().create(orderAmendment, { order });
    const transaction = useVegaTransactionStore.getState().transactions[1];
    useVegaTransactionStore
      .getState()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .update(transaction!.id, { status: VegaTxStatus.Pending });
    expect(
      useVegaTransactionStore.getState().transactions.map((t) => t?.status)
    ).toEqual([
      VegaTxStatus.Requested,
      VegaTxStatus.Pending,
      VegaTxStatus.Requested,
    ]);
    expect(
      useVegaTransactionStore
        .getState()
        .transactions.map((t) => t?.order?.price)
    ).toEqual(['1125', '1125', '1125']);

    const result = {
      orderAmendment: {
        marketId,
        orderId,
        price: '1122',
        sizeDelta: 0,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      },
    };
    expect(
      useVegaTransactionStore.getState().transactions.map((t) => t?.body)
    ).toStrictEqual([result, result, result]);
  });

  it('sets dialogOpen to false on dismiss', () => {
    useVegaTransactionStore.getState().create(orderCancellation);
    useVegaTransactionStore.getState().dismiss(0);
    expect(
      useVegaTransactionStore.getState().transactions[0]?.dialogOpen
    ).toEqual(false);
  });

  it('updates transaction result', () => {
    useVegaTransactionStore.getState().create(withdrawSubmission);
    useVegaTransactionStore.getState().update(0, processedTransactionUpdate);
    useVegaTransactionStore
      .getState()
      .updateTransactionResult(transactionResult);
    expect(
      useVegaTransactionStore.getState().transactions[0]?.transactionResult
    ).toEqual(transactionResult);
  });

  it('sets status to Error if transaction result status is error', () => {
    useVegaTransactionStore.getState().create(withdrawSubmission);
    useVegaTransactionStore.getState().update(0, processedTransactionUpdate);
    const error = 'error';
    useVegaTransactionStore.getState().updateTransactionResult({
      ...transactionResult,
      status: false,
      error,
    });
    const transaction = useVegaTransactionStore.getState().transactions[0];
    expect(transaction?.status).toEqual(VegaTxStatus.Error);
    expect(transaction?.error?.message).toEqual(error);
  });

  it('updates withdrawal', () => {
    useVegaTransactionStore.getState().create(withdrawSubmission);
    useVegaTransactionStore.getState().update(0, processedTransactionUpdate);
    useVegaTransactionStore
      .getState()
      .updateTransactionResult(transactionResult);
    useVegaTransactionStore
      .getState()
      .updateWithdrawal(withdrawal, withdrawalApproval);
    const transaction = useVegaTransactionStore.getState().transactions[0];
    expect(transaction?.withdrawalApproval).toEqual(withdrawalApproval);
    expect(transaction?.withdrawal).toEqual(withdrawal);
  });

  it('updates openVolume', () => {
    useVegaTransactionStore
      .getState()
      .create(closePosition, { isClosePosition: true });
    const openVolume = '0';
    useVegaTransactionStore.getState().update(0, processedTransactionUpdate);
    useVegaTransactionStore.getState().updatePosition({ marketId, openVolume });
    expect(
      useVegaTransactionStore.getState().transactions[0]?.openVolume
    ).toBeUndefined();
    useVegaTransactionStore
      .getState()
      .updateTransactionResult(transactionResult);
    useVegaTransactionStore.getState().updatePosition({ marketId, openVolume });
    expect(
      useVegaTransactionStore.getState().transactions[0]?.openVolume
    ).toEqual(openVolume);
  });
});
