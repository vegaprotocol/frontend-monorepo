import { renderHook } from '@testing-library/react-hooks';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useEthTransactionUpdater } from './use-ethereum-transaction-updater';
import waitForNextTick from 'flush-promises';
import {
  DepositBusEventDocument,
  VegaWalletContext,
} from '@vegaprotocol/wallet';
import type {
  DepositBusEventSubscription,
  DepositBusEventFieldsFragment,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import type { EthTransactionStore } from './use-ethereum-transaction-store';
import { DepositStatus } from '@vegaprotocol/types';

const pubKey = 'pubKey';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>
      <VegaWalletContext.Provider value={{ pubKey } as VegaWalletContextShape}>
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useEthTransactionUpdater(), { wrapper });
};

const updateDeposit = jest.fn();
const defaultState: Partial<EthTransactionStore> = {
  updateDeposit,
};

const mockTransactionStoreState = jest.fn<Partial<EthTransactionStore>, []>();

jest.mock('./use-ethereum-transaction-store', () => ({
  useEthTransactionStore: (
    selector: (state: Partial<EthTransactionStore>) => void
  ) => selector(mockTransactionStoreState()),
}));

const depositBusEvent: DepositBusEventFieldsFragment = {
  id: '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50',
  status: DepositStatus.STATUS_FINALIZED,
  amount: '100',
  asset: {
    __typename: 'Asset',
    id: 'asset-id',
    symbol: 'asset-symbol',
    decimals: 2,
  },
  createdTimestamp: '2022-07-05T14:25:47.815283706Z',
  creditedTimestamp: '2022-07-05T14:25:47.815283706Z',
  txHash: '0x123',
  __typename: 'Deposit',
};

const mockedDepositBusEvent: MockedResponse<DepositBusEventSubscription> = {
  request: {
    query: DepositBusEventDocument,
    variables: { partyId: pubKey },
  },
  result: {
    data: {
      busEvents: [
        {
          event: depositBusEvent,
        },
      ],
    },
  },
};

describe('useEthTransactionUpdater', () => {
  it('updates deposit on DepositBusEvents', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    const { waitForNextUpdate } = render([mockedDepositBusEvent]);
    waitForNextUpdate();
    await waitForNextTick();
    expect(updateDeposit).toHaveBeenCalledWith(depositBusEvent);
  });
});
