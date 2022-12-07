import { act, renderHook } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import type { FetchResult } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useVegaTransactionUpdater } from './use-vega-transaction-updater';
import { Schema } from '@vegaprotocol/types';
import type { WithdrawalApprovalQuery } from './__generated__/WithdrawalApproval';
import { WithdrawalApprovalDocument } from './__generated__/WithdrawalApproval';
import {
  OrderBusEventsDocument,
  TransactionEventDocument,
  WithdrawalBusEventDocument,
} from './__generated__/TransactionResult';
import type {
  OrderBusEventsSubscription,
  OrderBusEventFieldsFragment,
  WithdrawalBusEventSubscription,
  WithdrawalBusEventFieldsFragment,
  TransactionEventSubscription,
  TransactionEventFieldsFragment,
} from './__generated__/TransactionResult';

import type { VegaTransactionStore } from './use-vega-transaction-store';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useVegaTransactionUpdater(), { wrapper });
};

const pubKey = 'pubKey';

jest.mock('./use-vega-wallet', () => ({
  useVegaWallet: () => ({
    pubKey,
  }),
}));

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

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

describe('useVegaTransactionManager', () => {
  it('updates order on OrderBusEvents', () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    const orderBusEvent: OrderBusEventFieldsFragment = {
      __typename: 'Order',
    } as OrderBusEventFieldsFragment;
    const result: FetchResult<OrderBusEventsSubscription> = {
      data: {
        busEvents: [
          {
            type: Schema.BusEventType.Order,
            event: orderBusEvent,
          },
        ],
      },
    };
    const mockedOrderBusEvent: MockedResponse<OrderBusEventsSubscription> = {
      request: {
        query: OrderBusEventsDocument,
        variables: { partyId: pubKey },
      },
      result,
    };
    act(() => {
      render([mockedOrderBusEvent]);
    });
    expect(updateOrder).toHaveBeenCalledWith([orderBusEvent]);
  });

  it('updates transaction on TransactionResultBusEvents', () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    const transactionBusEvent: TransactionEventFieldsFragment = {
      __typename: 'TransactionResult',
    } as TransactionEventFieldsFragment;
    const result: FetchResult<TransactionEventSubscription> = {
      data: {
        busEvents: [
          {
            type: Schema.BusEventType.TransactionResult,
            event: transactionBusEvent,
          },
        ],
      },
    };
    const mockedOrderBusEvent: MockedResponse<TransactionEventSubscription> = {
      request: {
        query: TransactionEventDocument,
        variables: { partyId: pubKey },
      },
      result,
    };
    act(() => {
      render([mockedOrderBusEvent]);
    });
    expect(updateTransactionResult).toHaveBeenCalledWith([transactionBusEvent]);
  });

  it('updates withdrawal on WithdrawalBusEvents', () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    const withdrawalId = 'withdrawalId';
    const withdrawalBusEvent: WithdrawalBusEventFieldsFragment = {
      __typename: 'Withdrawal',
      id: withdrawalId,
    } as WithdrawalBusEventFieldsFragment;
    const erc20WithdrawalApproval: NonNullable<
      WithdrawalApprovalQuery['erc20WithdrawalApproval']
    > = {} as NonNullable<WithdrawalApprovalQuery['erc20WithdrawalApproval']>;
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
    const mockedWithdrawalApproval: MockedResponse<WithdrawalApprovalQuery> = {
      request: {
        query: WithdrawalApprovalDocument,
        variables: { withdrawalId },
      },
      result: {
        data: {
          erc20WithdrawalApproval,
        },
      },
    };

    act(() => {
      render([mockedWithdrawalBusEvent, mockedWithdrawalApproval]);
    });
    expect(updateWithdrawal).toHaveBeenCalledWith([
      withdrawalBusEvent,
      erc20WithdrawalApproval,
    ]);
  });
});
