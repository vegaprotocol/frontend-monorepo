import { act, renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useCompleteWithdraw } from './use-complete-withdraw.ts';
import type { Erc20ApprovalQuery } from './__generated__/Erc20Approval';
import { Erc20ApprovalDocument } from './__generated__/Erc20Approval';
import * as web3 from '@vegaprotocol/web3';
import * as sentry from '@sentry/react';

jest.mock('@vegaprotocol/web3', () => {
  const orig = jest.requireActual('@vegaprotocol/web3');
  return {
    ...orig,
    useBridgeContract: jest.fn().mockReturnValue({
      withdraw_asset: jest.fn(),
      isNewContract: true,
    }),
    useEthereumTransaction: jest.fn(),
  };
});

function setup(mocks?: MockedResponse[]) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useCompleteWithdraw(), { wrapper });
}

it('Should perform the Ethereum transaction with the fetched approval', async () => {
  const withdrawalId = 'withdrawal-id';
  const erc20WithdrawalApproval = {
    assetSource: 'asset-source',
    amount: '100',
    nonce: '1',
    creation: '1',
    signatures: 'signatures',
    targetAddress: 'target-address',
    expiry: 'expiry',
  };
  const mockERC20Approval: MockedResponse<Erc20ApprovalQuery> = {
    request: {
      query: Erc20ApprovalDocument,
      variables: { withdrawalId },
    },
    result: {
      data: {
        erc20WithdrawalApproval,
      },
    },
  };
  const mockPerform = jest.fn();
  jest.spyOn(web3, 'useEthereumTransaction').mockReturnValue({
    // @ts-ignore allow null transaction as its not used in hook logic
    transaction: { txHash: 'tx-hash' },
    perform: mockPerform,
  });
  const { result } = setup([mockERC20Approval]);
  act(() => {
    result.current.submit(withdrawalId);
  });
  await waitFor(() => {
    expect(mockPerform).toHaveBeenCalledWith(
      erc20WithdrawalApproval.assetSource,
      erc20WithdrawalApproval.amount,
      erc20WithdrawalApproval.targetAddress,
      erc20WithdrawalApproval.creation,
      erc20WithdrawalApproval.nonce,
      erc20WithdrawalApproval.signatures
    );
    expect(result.current.withdrawalId).toBe(withdrawalId);
  });
});

it('Captures an error if the erc20Withdrawal is not found', async () => {
  const withdrawalId = 'withdrawal-id';
  const mockERC20Approval: MockedResponse<Erc20ApprovalQuery> = {
    request: {
      query: Erc20ApprovalDocument,
      variables: { withdrawalId },
    },
    result: {
      data: {
        erc20WithdrawalApproval: null,
      },
    },
  };
  const mockPerform = jest.fn();
  const spyOnCaptureException = jest.spyOn(sentry, 'captureException');
  jest.spyOn(web3, 'useEthereumTransaction').mockReturnValue({
    // @ts-ignore allow null transaction as its not used in hook logic
    transaction: { txHash: 'tx-hash' },
    perform: mockPerform,
  });
  const { result } = setup([mockERC20Approval]);
  act(() => {
    result.current.submit(withdrawalId);
  });
  await waitFor(() => {
    expect(mockPerform).not.toHaveBeenCalled();
    expect(spyOnCaptureException).toHaveBeenCalled();
    expect(result.current.withdrawalId).toBe(withdrawalId);
  });
});

it('Captures an error if erc20 approval query fails', async () => {
  const withdrawalId = 'withdrawal-id';
  const mockERC20Approval: MockedResponse<Erc20ApprovalQuery> = {
    request: {
      query: Erc20ApprovalDocument,
      variables: { withdrawalId },
    },
    error: new Error('query failed'),
  };
  const mockPerform = jest.fn();
  const spyOnCaptureException = jest.spyOn(sentry, 'captureException');
  jest.spyOn(web3, 'useEthereumTransaction').mockReturnValue({
    // @ts-ignore allow null transaction as its not used in hook logic
    transaction: { txHash: 'tx-hash' },
    perform: mockPerform,
  });
  const { result } = setup([mockERC20Approval]);
  act(() => {
    result.current.submit(withdrawalId);
  });
  await waitFor(() => {
    expect(mockPerform).not.toHaveBeenCalled();
    expect(spyOnCaptureException).toHaveBeenCalled();
    expect(result.current.withdrawalId).toBe(withdrawalId);
  });
});
