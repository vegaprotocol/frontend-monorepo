import { act, renderHook } from '@testing-library/react-hooks';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { ERC20_APPROVAL_QUERY_NEW } from './queries';
import * as web3 from '@vegaprotocol/web3';
import * as wallet from '@vegaprotocol/wallet';
import type { WithdrawalFields } from './use-withdraw';
import { useWithdraw } from './use-withdraw';
import type { Erc20ApprovalNew } from './__generated__/Erc20ApprovalNew';

jest.mock('@vegaprotocol/web3', () => ({
  useBridgeContract: jest.fn(),
  useEthereumTransaction: jest.fn(),
}));

jest.mock('@vegaprotocol/wallet', () => ({
  useVegaWallet: jest.fn().mockReturnValue({ keypair: { pub: 'pubkey' } }),
  useVegaTransaction: jest.fn().mockReturnValue({
    transaction: {},
    send: jest.fn(),
    reset: jest.fn(),
  }),
}));

function setup(mocks?: MockedResponse[], cancelled = false) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useWithdraw(cancelled, true), { wrapper });
}

const signature =
  'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909';
const derivedWithdrawalId =
  '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

let pubkey: string;
let mockSend: jest.Mock;
let mockPerform: jest.Mock;
let mockEthReset: jest.Mock;
let mockVegaReset: jest.Mock;
let withdrawalInput: WithdrawalFields;
let mockERC20Approval: MockedResponse<Erc20ApprovalNew>;

beforeEach(() => {
  pubkey = 'pubkey';
  mockSend = jest.fn().mockReturnValue(Promise.resolve({ signature }));
  mockPerform = jest.fn();
  mockEthReset = jest.fn();
  mockVegaReset = jest.fn();

  jest.spyOn(web3, 'useEthereumTransaction').mockReturnValue({
    // @ts-ignore allow null transaction as its not used in hook logic
    transaction: null,
    perform: mockPerform,
    reset: mockEthReset,
  });
  jest
    .spyOn(wallet, 'useVegaWallet')
    // @ts-ignore only need to mock keypair
    .mockReturnValue({ keypair: { pub: pubkey } });
  jest.spyOn(wallet, 'useVegaTransaction').mockReturnValue({
    // @ts-ignore allow null transaction as its not used in hook logic
    transaction: null,
    send: mockSend,
    reset: mockVegaReset,
  });

  withdrawalInput = {
    amount: '100',
    asset: 'asset-id',
    receiverAddress: 'receiver-address',
  };
  mockERC20Approval = {
    request: {
      query: ERC20_APPROVAL_QUERY_NEW,
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

it('Creates withdrawal and immediately submits Ethereum transaction', async () => {
  const { result } = setup([mockERC20Approval]);

  await act(async () => {
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

  expect(result.current.withdrawalId).toEqual(derivedWithdrawalId);

  // Query 'poll' not returned yet and eth transaction shouldn't have
  // started
  expect(result.current.approval).toEqual(null);
  expect(mockPerform).not.toHaveBeenCalled();

  // Advance query delay time so query result is returned and the
  // eth transaction should be called with the approval query result
  await act(async () => {
    jest.advanceTimersByTime(mockERC20Approval.delay || 0);
  });

  expect(result.current.approval).toEqual(
    // @ts-ignore MockedRespones types inteferring
    mockERC20Approval.result.data.erc20WithdrawalApproval
  );
  expect(mockPerform).toHaveBeenCalledWith(
    // @ts-ignore MockedRespones types inteferring
    mockERC20Approval.result.data.erc20WithdrawalApproval
  );
});

it('Doesnt perform Ethereum tx if cancelled', async () => {
  const { result } = setup([mockERC20Approval], true);

  await act(async () => {
    result.current.submit(withdrawalInput);
  });

  await act(async () => {
    jest.advanceTimersByTime(mockERC20Approval.delay || 0);
  });

  expect(result.current.approval).toEqual(
    // @ts-ignore MockedRespone types inteferring
    mockERC20Approval.result.data.erc20WithdrawalApproval
  );

  // Approval set, but cancelled flag is set, so the Ethereum
  // TX should not be invoked
  expect(mockPerform).not.toHaveBeenCalled();
});

it('Reset will reset both transactions', async () => {
  const { result } = setup([mockERC20Approval]);

  await act(async () => {
    result.current.reset();
  });

  expect(mockEthReset).toHaveBeenCalled();
  expect(mockVegaReset).toHaveBeenCalled();
});
