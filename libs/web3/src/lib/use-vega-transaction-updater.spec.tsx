import { renderHook, waitFor } from '@testing-library/react';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import { useVegaTransactionUpdater } from './use-vega-transaction-updater';
import {
  OrderTxUpdateDocument,
  TransactionEventDocument,
  WithdrawalBusEventDocument,
  type OrderTxUpdateSubscription,
  type OrderTxUpdateFieldsFragment,
  type WithdrawalBusEventSubscription,
  type WithdrawalBusEventFieldsFragment,
  type TransactionEventSubscription,
  type TransactionEventFieldsFragment,
} from './__generated__/TransactionResult';

import { type VegaTransactionStore } from './use-vega-transaction-store';
import {
  AssetStatus,
  BusEventType,
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
  WithdrawalStatus,
} from '@vegaprotocol/types';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

  return renderHook(() => useVegaTransactionUpdater(), { wrapper });
};

const pubKey = 'pubKey';

jest.mock('@vegaprotocol/wallet', () => ({
  useVegaWallet: () => ({
    pubKey,
  }),
}));

const mockWaitForWithdrawalApproval = jest.fn();

jest.mock('./wait-for-withdrawal-approval', () => ({
  waitForWithdrawalApproval: () => mockWaitForWithdrawalApproval(),
}));

const updateWithdrawal = jest.fn();
const updateOrder = jest.fn();
const updateTransactionResult = jest.fn();

const defaultState: Partial<VegaTransactionStore> = {
  updateWithdrawal,
  updateOrder,
  updateTransactionResult,
};

const mockTransactionStoreState = jest.fn<Partial<VegaTransactionStore>, []>();

jest.mock('./use-vega-transaction-store', () => ({
  useVegaTransactionStore: (
    selector: (state: Partial<VegaTransactionStore>) => void
  ) => selector(mockTransactionStoreState()),
}));

const orderUpdate: OrderTxUpdateFieldsFragment = {
  type: OrderType.TYPE_LIMIT,
  id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
  status: OrderStatus.STATUS_ACTIVE,
  rejectionReason: null,
  createdAt: '2022-07-05T14:25:47.815283706Z',
  expiresAt: '2022-07-05T14:25:47.815283706Z',
  size: '10',
  remaining: '10',
  price: '300000',
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
  side: Side.SIDE_BUY,
  marketId: 'market-id',
  __typename: 'OrderUpdate',
};
const mockedOrderUpdate: MockedResponse<OrderTxUpdateSubscription> = {
  request: {
    query: OrderTxUpdateDocument,
    variables: { partyId: pubKey },
  },
  result: {
    data: {
      orders: [orderUpdate],
    },
  },
};

const transactionResultBusEvent: TransactionEventFieldsFragment = {
  __typename: 'TransactionResult',
  partyId: pubKey,
  hash: 'hash',
  status: true,
  error: null,
};
const mockedTransactionResultBusEvent: MockedResponse<TransactionEventSubscription> =
  {
    request: {
      query: TransactionEventDocument,
      variables: { partyId: pubKey },
    },
    result: {
      data: {
        busEvents: [
          {
            type: BusEventType.TransactionResult,
            event: transactionResultBusEvent,
          },
        ],
      },
    },
  };
const withdrawalBusEvent: WithdrawalBusEventFieldsFragment = {
  id: '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50',
  status: WithdrawalStatus.STATUS_OPEN,
  amount: '100',
  asset: {
    __typename: 'Asset',
    id: 'asset-id',
    name: 'asset-name',
    symbol: 'asset-symbol',
    decimals: 2,
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0x123',
    },
  },
  createdTimestamp: '2022-07-05T14:25:47.815283706Z',
  withdrawnTimestamp: '2022-07-05T14:25:47.815283706Z',
  txHash: '0x123',
  details: {
    __typename: 'Erc20WithdrawalDetails',
    receiverAddress: '0x123',
  },
  pendingOnForeignChain: false,
  __typename: 'Withdrawal',
};

const mockedWithdrawalBusEvent: MockedResponse<WithdrawalBusEventSubscription> =
  {
    request: {
      query: WithdrawalBusEventDocument,
      variables: { partyId: pubKey },
    },
    result: {
      data: {
        busEvents: [
          {
            event: withdrawalBusEvent,
          },
        ],
      },
    },
  };

describe('useVegaTransactionManager', () => {
  it('updates order on OrderTxUpdate', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    render([mockedOrderUpdate]);
    await waitFor(() => {
      expect(updateOrder).toHaveBeenCalledWith(orderUpdate);
    });
  });

  it('updates transaction on TransactionResultBusEvents', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    render([mockedTransactionResultBusEvent]);
    await waitFor(() => {
      expect(updateTransactionResult).toHaveBeenCalledWith(
        transactionResultBusEvent
      );
    });
  });

  it('updates withdrawal on WithdrawalBusEvents', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    const erc20WithdrawalApproval = {};
    mockWaitForWithdrawalApproval.mockResolvedValueOnce(
      erc20WithdrawalApproval
    );
    render([mockedWithdrawalBusEvent]);
    await waitFor(() => {
      expect(updateWithdrawal).toHaveBeenCalledWith(
        withdrawalBusEvent,
        erc20WithdrawalApproval
      );
    });
  });
});
