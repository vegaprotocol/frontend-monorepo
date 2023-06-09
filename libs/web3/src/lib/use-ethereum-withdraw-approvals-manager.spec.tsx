import { useEthWithdrawApprovalsManager } from './use-ethereum-withdraw-approvals-manager';
import { renderHook, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import waitForNextTick from 'flush-promises';
import * as Schema from '@vegaprotocol/types';
import {
  ApprovalStatus,
  WithdrawalFailure,
} from './use-ethereum-withdraw-approvals-store';
import BigNumber from 'bignumber.js';
import type {
  EthWithdrawApprovalStore,
  EthWithdrawalApprovalState,
} from './use-ethereum-withdraw-approvals-store';
import type { EthTransactionStore } from './use-ethereum-transaction-store';

import { WithdrawalApprovalDocument } from '@vegaprotocol/wallet';
import type { WithdrawalApprovalQuery } from '@vegaprotocol/wallet';

import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';

const mockWeb3Provider = jest.fn();

let mockChainId: number | undefined = 111111;
jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    provider: mockWeb3Provider(),
    chainId: mockChainId,
  }),
}));

const mockEthTransactionStoreState = jest.fn<
  Partial<EthTransactionStore>,
  []
>();

jest.mock('./use-ethereum-transaction-store', () => ({
  ...jest.requireActual('./use-ethereum-transaction-store'),
  useEthTransactionStore: (
    selector: (state: Partial<EthTransactionStore>) => void
  ) => selector(mockEthTransactionStoreState()),
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

const mockUseEthereumConfig = {
  collateral_bridge_contract: {
    address: 'address',
  },
  chain_id: '111111',
};

jest.mock('./use-ethereum-config', () => ({
  useEthereumConfig: () => ({
    config: mockUseEthereumConfig,
  }),
}));

jest.mock('@vegaprotocol/smart-contracts', () => ({
  CollateralBridge: jest.fn().mockImplementation(),
}));

const update = jest.fn();
const withdrawalId = 'withdrawalId';
const createWithdrawTransaction = (
  transaction?: Partial<EthWithdrawalApprovalState>
): EthWithdrawalApprovalState => ({
  id: 0,
  status: ApprovalStatus.Idle,
  createdAt: new Date('2022-12-12T11:24:40.301Z'),
  dialogOpen: true,
  withdrawal: {
    id: withdrawalId,
    status: Schema.WithdrawalStatus.STATUS_OPEN,
    createdTimestamp: '2022-12-12T11:24:40.301Z',
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
  ...transaction,
});

const create = jest.fn();

const getSigner = jest.fn();
mockWeb3Provider.mockReturnValue({
  getSigner,
});
mockUseGetWithdrawDelay.mockReturnValue(() => Promise.resolve(60));
mockUseGetWithdrawThreshold.mockReturnValue(() =>
  Promise.resolve(new BigNumber(100))
);

let dateNowSpy: jest.SpyInstance<number, []>;

const erc20WithdrawalApproval: WithdrawalApprovalQuery['erc20WithdrawalApproval'] =
  {
    assetSource: 'asset-source',
    amount: '100',
    nonce: '1',
    creation: '1',
    signatures: 'signatures',
    targetAddress: 'target-address',
  };

const mockedNetworkParams: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NetworkParamsDocument,
    variables: {},
  },
  result: {
    data: {
      networkParametersConnection: {
        edges: [
          {
            node: {
              key: 'blockchains.ethereumConfig',
              value: JSON.stringify({
                collateral_bridge_contract: { address: '' },
              }),
            },
          },
        ],
      },
    },
  },
};

const mockedWithdrawalApproval: MockedResponse<WithdrawalApprovalQuery> = {
  request: {
    query: WithdrawalApprovalDocument,
    variables: { withdrawalId },
  },
  result: {
    data: { erc20WithdrawalApproval },
  },
};

const render = (
  mocks: MockedResponse[] = [mockedWithdrawalApproval, mockedNetworkParams]
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useEthWithdrawApprovalsManager(), { wrapper });
};

describe('useEthWithdrawApprovalsManager', () => {
  beforeEach(() => {
    update.mockReset();
    create.mockReset();
    mockEthTransactionStoreState.mockReset();
    mockEthWithdrawApprovalsStoreState.mockReset();
  });

  afterEach(() => {
    if (dateNowSpy) {
      dateNowSpy.mockRestore();
    }
  });

  it('sendTx of first pending transaction', async () => {
    mockEthTransactionStoreState.mockReturnValue({ create });
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [
        createWithdrawTransaction(),
        createWithdrawTransaction({ id: 1 }),
      ],
      update,
    });
    const { rerender } = render();
    expect(update.mock.calls[0][0]).toEqual(0);
    expect(update.mock.calls[0][1].status).toEqual(ApprovalStatus.Pending);
    rerender();
    expect(update.mock.calls[1][0]).toEqual(1);
    expect(update.mock.calls[1][1].status).toEqual(ApprovalStatus.Pending);
  });

  it('sets status to error if wrong asset type', async () => {
    const transaction = createWithdrawTransaction();
    transaction.withdrawal.asset.source.__typename = 'BuiltinAsset';
    mockEthTransactionStoreState.mockReturnValue({ create });
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    render();
    expect(update.mock.calls[0][1].status).toEqual(ApprovalStatus.Error);
  });

  it('sets status to pending', async () => {
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [createWithdrawTransaction()],
      update,
    });
    mockEthTransactionStoreState.mockReturnValue({ create });
    render();
    expect(update.mock.calls[0][1].status).toEqual(ApprovalStatus.Pending);
  });

  it('sets status to delayed if amount is greater than threshold', async () => {
    const transaction = createWithdrawTransaction();
    mockUseGetWithdrawThreshold.mockReturnValueOnce(() =>
      Promise.resolve(
        new BigNumber(transaction.withdrawal.amount)
          .dividedBy(Math.pow(10, transaction.withdrawal.asset.decimals))
          .dividedBy(2)
      )
    );
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    mockEthTransactionStoreState.mockReturnValue({ create });

    dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() =>
        new Date(transaction.withdrawal.createdTimestamp).valueOf()
      );
    render();
    await waitForNextTick();
    expect(update.mock.calls[1][1].status).toEqual(ApprovalStatus.Delayed);
  });

  it('fetch approval if not provided', async () => {
    const transaction = createWithdrawTransaction();
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    mockEthTransactionStoreState.mockReturnValue({ create });
    render();
    await waitForNextTick();
    await waitForNextTick();
    expect(update.mock.calls[1][1].approval).toEqual(erc20WithdrawalApproval);
  });

  it('sets status to error if withdraw dependencies not met', async () => {
    const transaction = createWithdrawTransaction();
    transaction.approval = {
      ...erc20WithdrawalApproval,
      signatures: '',
    };
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    mockEthTransactionStoreState.mockReturnValue({ create });
    render();
    await waitForNextTick();
    expect(update.mock.calls[1][1].status).toEqual(ApprovalStatus.Error);
  });

  it('sets status to ready and creates eth transaction', async () => {
    const transaction = createWithdrawTransaction();
    transaction.approval = erc20WithdrawalApproval;
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    mockEthTransactionStoreState.mockReturnValue({ create });
    render();
    await waitForNextTick();
    expect(create).toBeCalledWith({}, 'withdraw_asset', [
      erc20WithdrawalApproval.assetSource,
      erc20WithdrawalApproval.amount,
      erc20WithdrawalApproval.targetAddress,
      erc20WithdrawalApproval.creation,
      erc20WithdrawalApproval.nonce,
      erc20WithdrawalApproval.signatures,
    ]);
  });

  it('detect wrong chainId', () => {
    mockChainId = 1;
    const transaction = createWithdrawTransaction();
    mockEthTransactionStoreState.mockReturnValue({ create });
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    render();
    expect(update.mock.calls[0][1].status).toEqual(ApprovalStatus.Pending);
    expect(update.mock.calls[0][1].message).toEqual('Change network');
    expect(update.mock.calls[0][1].failureReason).toEqual(
      WithdrawalFailure.WrongConnection
    );
    mockChainId = 111111;
  });

  it('detect no chainId', () => {
    mockChainId = undefined;
    const transaction = createWithdrawTransaction();
    mockEthTransactionStoreState.mockReturnValue({ create });
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    render();
    expect(update.mock.calls[0][1].status).toEqual(ApprovalStatus.Pending);
    expect(update.mock.calls[0][1].message).toEqual(
      'Connect wallet to withdraw'
    );
    expect(update.mock.calls[0][1].failureReason).toEqual(
      WithdrawalFailure.NoConnection
    );
    mockChainId = 111111;
  });

  it('catch ethereum errors', async () => {
    const transaction = createWithdrawTransaction();
    mockUseGetWithdrawThreshold.mockReturnValueOnce(() => {
      throw new Error('call revert exception');
    });

    mockEthTransactionStoreState.mockReturnValue({ create });
    mockEthWithdrawApprovalsStoreState.mockReturnValue({
      transactions: [transaction],
      update,
    });
    render();
    await waitFor(() => {
      const lastCall = update.mock.calls.pop();
      expect(lastCall[1].status).toEqual(ApprovalStatus.Error);
      expect(lastCall[1].message).toEqual('Something went wrong');
    });
  });
});
