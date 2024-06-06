import { renderHook, waitFor } from '@testing-library/react';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import { useEthTransactionUpdater } from './use-ethereum-transaction-updater';
import { DepositBusEventDocument } from './__generated__/TransactionResult';
import {
  type DepositBusEventSubscription,
  type DepositBusEventFieldsFragment,
} from './__generated__/TransactionResult';
import { type EthTransactionStore } from './use-ethereum-transaction-store';
import { AssetStatus, DepositStatus } from '@vegaprotocol/types';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';

const pubKey = 'pubKey';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>
      <MockedWalletProvider>{children}</MockedWalletProvider>
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
    name: '',
    quantum: '',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      chainId: '1',
      contractAddress: '0x0',
    },
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
    mockConfig.store.setState({ pubKey });
    mockTransactionStoreState.mockReturnValue(defaultState);
    render([mockedDepositBusEvent]);
    await waitFor(() => {
      expect(updateDeposit).toHaveBeenCalledWith(depositBusEvent);
    });
    mockConfig.reset();
  });
});
