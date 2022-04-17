import { act, renderHook } from '@testing-library/react-hooks';
import type { VegaWalletContextShape } from './context';
import { VegaWalletContext } from './context';
import type { ReactNode } from 'react';
import { useVegaTransaction, VegaTxStatus } from './use-vega-transaction';
import type { OrderSubmission } from './types';

const defaultWalletContext = {
  keypair: null,
  keypairs: [],
  sendTx: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(context?: Partial<VegaWalletContextShape>) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletContext.Provider value={{ ...defaultWalletContext, ...context }}>
      {children}
    </VegaWalletContext.Provider>
  );
  return renderHook(() => useVegaTransaction(), { wrapper });
}

test('Has the correct default state', () => {
  const { result } = setup();
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  expect(result.current.transaction.txHash).toEqual(null);
  expect(result.current.transaction.signature).toEqual(null);
  expect(result.current.transaction.error).toEqual(null);
  expect(typeof result.current.reset).toEqual('function');
  expect(typeof result.current.send).toEqual('function');
});

test('If provider returns null status should be default', async () => {
  const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(null));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmission);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
});

test('Handles a single error', async () => {
  const errorMessage = 'Oops error!';
  const mockSendTx = jest
    .fn()
    .mockReturnValue(Promise.resolve({ error: errorMessage }));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmission);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
  expect(result.current.transaction.error).toEqual({ error: errorMessage });
});

test('Handles multiple errors', async () => {
  const errorObj = {
    errors: {
      something: 'Went wrong!',
    },
  };
  const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(errorObj));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmission);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
  expect(result.current.transaction.error).toEqual(errorObj);
});

test('Returns the signature if successful', async () => {
  const successObj = {
    tx: {
      inputData: 'input-data',
      signature: {
        algo: 'algo',
        version: 1,
        value: 'signature',
      },
    },
    txHash: '0x123',
  };
  const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(successObj));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmission);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Pending);
  expect(result.current.transaction.txHash).toEqual(successObj.txHash);
  expect(result.current.transaction.signature).toEqual(
    successObj.tx.signature.value
  );
});
