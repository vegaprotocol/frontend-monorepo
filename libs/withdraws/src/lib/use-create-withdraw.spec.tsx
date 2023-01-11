import { act, renderHook } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import type { WithdrawalArgs } from './use-create-withdraw';
import { useCreateWithdraw } from './use-create-withdraw';
import { Erc20ApprovalDocument } from './__generated__/Erc20Approval';
import type { Erc20ApprovalQuery } from './__generated__/Erc20Approval';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import {
  initialState,
  VegaTxStatus,
  VegaWalletContext,
  determineId,
} from '@vegaprotocol/wallet';
import { waitFor } from '@testing-library/react';
import type {
  WithdrawalEventSubscription,
  WithdrawalFieldsFragment,
} from './__generated__/Withdrawal';
import { WithdrawalEventDocument } from './__generated__/Withdrawal';
import * as Schema from '@vegaprotocol/types';

function setup(
  vegaWalletContext: Partial<VegaWalletContextShape>,
  mocks?: MockedResponse[]
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>
      <VegaWalletContext.Provider
        value={vegaWalletContext as VegaWalletContextShape}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useCreateWithdraw(), { wrapper });
}

const txHash = 'tx-hash';
const signature =
  'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909';
const derivedWithdrawalId = determineId(signature);

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

const pubKey = '0x123';
let mockSend: jest.Mock;
let withdrawalInput: WithdrawalArgs;
let withdrawalEvent: WithdrawalFieldsFragment;
let mockERC20Approval: MockedResponse<Erc20ApprovalQuery>;
let mockWithdrawalEvent: MockedResponse<WithdrawalEventSubscription>;

beforeEach(() => {
  mockSend = jest
    .fn()
    .mockReturnValue(Promise.resolve({ transactionHash: txHash, signature }));
  withdrawalEvent = {
    id: '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50',
    status: Schema.WithdrawalStatus.STATUS_OPEN,
    amount: '100',
    asset: {
      __typename: 'Asset',
      id: 'asset-id',
      name: 'asset-name',
      symbol: 'asset-symbol',
      decimals: 2,
      status: Schema.AssetStatus.STATUS_ENABLED,
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
  withdrawalInput = {
    amount: '100',
    asset: 'asset-id',
    receiverAddress: 'receiver-address',
    availableTimestamp: null,
  };
  mockERC20Approval = {
    request: {
      query: Erc20ApprovalDocument,
      variables: { withdrawalId: derivedWithdrawalId },
    },
    result: {
      data: {
        erc20WithdrawalApproval: {
          __typename: 'Erc20WithdrawalApproval',
          assetSource: 'asset-source',
          amount: '100',
          nonce: '1',
          signatures: 'signatures',
          targetAddress: 'targetAddress',
          creation: '1',
        },
      },
    },
    delay: 2000,
  };
  mockWithdrawalEvent = {
    request: {
      query: WithdrawalEventDocument,
      variables: { partyId: pubKey },
    },
    result: {
      data: {
        busEvents: [
          {
            event: withdrawalEvent,
            __typename: 'BusEvent',
          },
        ],
      },
    },
    delay: 1000,
  };
});

it('creates withdrawal and waits for approval creation', async () => {
  const { result } = setup({ sendTx: mockSend, pubKey }, [
    mockWithdrawalEvent,
    mockERC20Approval,
  ]);

  expect(result.current.transaction).toEqual(initialState);
  expect(result.current.submit).toEqual(expect.any(Function));
  expect(result.current.reset).toEqual(expect.any(Function));
  expect(result.current.approval).toEqual(null);

  act(() => {
    result.current.submit(withdrawalInput);
  });

  expect(mockSend).toHaveBeenCalledWith(pubKey, {
    withdrawSubmission: {
      amount: withdrawalInput.amount,
      asset: withdrawalInput.asset,
      ext: {
        erc20: {
          receiverAddress: withdrawalInput.receiverAddress,
        },
      },
    },
  });

  expect(result.current.transaction.status).toEqual(VegaTxStatus.Requested);

  await waitFor(() => {
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Pending);
    expect(result.current.transaction.dialogOpen).toBe(true);
    // Withdrawal event should not be found yet
    expect(result.current.withdrawal).toEqual(null);
    // Poll for erc20Approval should not be complete yet
    expect(result.current.approval).toEqual(null);
  });

  await act(async () => {
    // Advance time by delay plus interval length to ensure mock result is triggered
    // eslint-disable-next-line
    jest.advanceTimersByTime(mockWithdrawalEvent.delay! + 1000);
  });

  expect(result.current.withdrawal).toEqual(withdrawalEvent);

  await act(async () => {
    // Advance time by delay plus interval length to ensure mock result is triggered
    // eslint-disable-next-line
    jest.advanceTimersByTime(mockERC20Approval.delay! + 1000);
  });

  expect(result.current.transaction.status).toEqual(VegaTxStatus.Complete);
  expect(result.current.approval).toEqual(
    // @ts-ignore MockedRespones types inteferring
    mockERC20Approval.result.data.erc20WithdrawalApproval
  );
});
