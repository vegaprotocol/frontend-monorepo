import { act, renderHook } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { ERC20_APPROVAL_QUERY } from './queries';
import type { WithdrawalFields } from './use-create-withdraw';
import { useCreateWithdraw } from './use-create-withdraw';
import type { Erc20Approval } from './__generated__/Erc20Approval';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import {
  initialState,
  VegaTxStatus,
  VegaWalletContext,
} from '@vegaprotocol/wallet';
import { waitFor } from '@testing-library/react';
import { determineId } from '@vegaprotocol/react-helpers';

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

const pubkey = '0x123';
let mockSend: jest.Mock;
let withdrawalInput: WithdrawalFields;
let mockERC20Approval: MockedResponse<Erc20Approval>;

beforeEach(() => {
  mockSend = jest
    .fn()
    .mockReturnValue(
      Promise.resolve({ txHash, tx: { signature: { value: signature } } })
    );

  withdrawalInput = {
    amount: '100',
    asset: 'asset-id',
    receiverAddress: 'receiver-address',
  };
  mockERC20Approval = {
    request: {
      query: ERC20_APPROVAL_QUERY,
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
          expiry: 'expiry',
          creation: '1',
        },
      },
    },
    delay: 5000,
  };
});

it('Creates withdrawal and waits for approval creation', async () => {
  const { result } = setup(
    // @ts-ignore only need pub property from keypair
    { sendTx: mockSend, keypair: { pub: pubkey } },
    [mockERC20Approval]
  );

  expect(result.current.transaction).toEqual(initialState);
  expect(result.current.submit).toEqual(expect.any(Function));
  expect(result.current.reset).toEqual(expect.any(Function));
  expect(result.current.approval).toEqual(null);

  act(() => {
    result.current.submit(withdrawalInput);
  });

  expect(mockSend).toHaveBeenCalledWith({
    pubKey: pubkey,
    propagate: true,
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
    // Poll for erc20Approval should not be complete yet
    expect(result.current.approval).toEqual(null);
  });

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
