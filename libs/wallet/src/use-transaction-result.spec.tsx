import type { ReactNode } from 'react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import * as Types from '@vegaprotocol/types';
import type { TransactionEventSubscription } from './__generated__/TransactionResult';
import { TransactionEventDocument } from './__generated__/TransactionResult';
import { useTransactionResult } from './use-transaction-result';

const pubKey = 'test-pubkey';
const txHash = '0x123';
const event = {
  __typename: 'TransactionResult',
  partyId: pubKey,
  hash: txHash,
  status: true,
  error: null,
};

function setup(mock: MockedResponse) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[mock]}>{children}</MockedProvider>
  );
  return renderHook(() => useTransactionResult(), { wrapper });
}

describe('useTransactionResult', () => {
  it('resolves when a matching txhash is found', async () => {
    const mock: MockedResponse<TransactionEventSubscription> = {
      request: {
        query: TransactionEventDocument,
        variables: {
          partyId: pubKey,
        },
      },
      result: {
        data: {
          busEvents: [
            {
              type: Types.BusEventType.TransactionResult,
              event,
              __typename: 'BusEvent',
            },
          ] as TransactionEventSubscription['busEvents'],
        },
      },
    };
    const { result } = setup(mock);
    expect(result.current).toEqual(expect.any(Function));
    const promi = result.current(txHash, pubKey);
    expect(typeof promi === 'object' && typeof promi.then === 'function').toBe(
      true
    );
    const res = await promi;
    expect(res).toEqual(event);
  });
});
