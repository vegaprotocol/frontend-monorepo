import { useEthWithdrawApprovalsManager } from './use-ethereum-withdraw-approvals-manager';
import { renderHook } from '@testing-library/react-hooks';
import type { MockedResponse } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import waitForNextTick from 'flush-promises';
import * as Schema from '@vegaprotocol/types';
import { ApprovalStatus } from './use-ethereum-withdraw-approvals-store';
import BigNumber from 'bignumber.js';
import type { EthWithdrawApprovalStore } from './use-ethereum-withdraw-approvals-store';
import type {
  EthTransactionStore,
  EthStoredTxState,
} from './use-ethereum-transaction-store';

import { EthTxStatus } from './use-ethereum-transaction';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useEthWithdrawApprovalsManager(), { wrapper });
};

const mockWeb3Provider = jest.fn();

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    provider: mockWeb3Provider(),
  }),
}));

const mockTransactionStoreState = jest.fn<Partial<EthTransactionStore>, []>();

jest.mock('./use-ethereum-transaction-store', () => ({
  ...jest.requireActual('./use-ethereum-transaction-store'),
  useVegaTransactionStore: (
    selector: (state: Partial<EthTransactionStore>) => void
  ) => selector(mockTransactionStoreState()),
}));

const mockEthWithdrawApprovalsStoreState = jest.fn<
  Partial<EthWithdrawApprovalStore>,
  []
>();

jest.mock('./use-ethereum-withdraw-approvals-store', () => ({
  ...jest.requireActual('./use-ethereum-withdraw-approvals-store'),
  useEthWithdrawApprovalsStore: (
    selector: (state: Partial<EthWithdrawApprovalStore>) => void
  ) => selector(mockEthWithdrawApprovalsStoreState()),
}));

const mockUseGetWithdrawThreshold = jest.fn();

jest.mock('./use-get-withdraw-threshold', () => ({
  useGetWithdrawThreshold: () => mockUseGetWithdrawThreshold(),
}));

const mockUseGetWithdrawDelay = jest.fn();

jest.mock('./use-get-withdraw-delay', () => ({
  useGetWithdrawDelay: () => mockUseGetWithdrawDelay(),
}));

const updateWithdrawApproval = jest.fn();
const defaultWithdrawApprovalStoreState: Partial<EthWithdrawApprovalStore> = {
  transactions: [
    {
      id: 0,
      status: ApprovalStatus.Idle,
      createdAt: new Date('2022-12-12T11:24:40.301Z'),
      dialogOpen: true,
      withdrawal: {
        id: '1',
        status: Schema.WithdrawalStatus.STATUS_OPEN,
        createdTimestamp: '',
        pendingOnForeignChain: false,
        amount: '50',
        asset: {
          __typename: 'Asset',
          id: 'fdf0ec118d98393a7702cf72e46fc87ad680b152f64b2aac59e093ac2d688fbb',
          name: 'USDT-T',
          symbol: 'USDT-T',
          decimals: 18,
          status: Schema.AssetStatus.STATUS_ENABLED,
          source: {
            __typename: 'ERC20',
            contractAddress: 'contractAddress',
          },
        },
      },
    },
    {
      id: 1,
      status: ApprovalStatus.Idle,
      createdAt: new Date('2022-12-12T11:24:40.301Z'),
      dialogOpen: true,
      withdrawal: {
        id: '1',
        status: Schema.WithdrawalStatus.STATUS_OPEN,
        createdTimestamp: '',
        pendingOnForeignChain: false,
        amount: '50',
        asset: {
          __typename: 'Asset',
          id: 'fdf0ec118d98393a7702cf72e46fc87ad680b152f64b2aac59e093ac2d688fbb',
          name: 'USDT-T',
          symbol: 'USDT-T',
          decimals: 18,
          status: Schema.AssetStatus.STATUS_ENABLED,
          source: {
            __typename: 'ERC20',
            contractAddress: 'contractAddress',
          },
        },
      },
    },
  ],
  update: updateWithdrawApproval,
};

const createEthTransaction = jest.fn();

const defaultEthTransactionStoreState: Partial<EthTransactionStore> = {
  transactions: [
    {
      id: 0,
      status: EthTxStatus.Default,
    } as EthStoredTxState,
  ],
  create: createEthTransaction,
};

describe('useVegaTransactionManager', () => {
  beforeEach(() => {
    updateWithdrawApproval.mockReset();
    createEthTransaction.mockReset();
    mockTransactionStoreState.mockReset();
    mockEthWithdrawApprovalsStoreState.mockReset();
  });

  it('sendTx of first pending transaction', async () => {
    mockTransactionStoreState.mockReturnValue(defaultEthTransactionStoreState);
    mockEthWithdrawApprovalsStoreState.mockReturnValue(
      defaultWithdrawApprovalStoreState
    );
    const getSigner = jest.fn();
    mockWeb3Provider.mockReturnValue({
      getSigner,
    });
    mockUseGetWithdrawDelay.mockReturnValue(() => Promise.resolve(60));
    mockUseGetWithdrawThreshold.mockReturnValue(() =>
      Promise.resolve(new BigNumber(100))
    );
    const { waitForNextUpdate } = render();
    waitForNextUpdate();
    await waitForNextTick();
    // expect(updateWithdrawApproval).not.toBeCalled();
    expect(updateWithdrawApproval.mock.calls[0][0]).toEqual(0);
    expect(updateWithdrawApproval.mock.calls[0][1].status).toEqual(
      ApprovalStatus.Pending
    );
    expect(updateWithdrawApproval.mock.calls[1][0]).toEqual(1);
    expect(updateWithdrawApproval.mock.calls[1][1].status).toEqual(
      ApprovalStatus.Pending
    );
  });
});
