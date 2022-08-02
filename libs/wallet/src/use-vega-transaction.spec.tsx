import { act, renderHook } from '@testing-library/react-hooks';
import type { VegaWalletContextShape } from './context';
import { VegaWalletContext } from './context';
import type { ReactNode } from 'react';
import { useVegaTransaction, VegaTxStatus } from './use-vega-transaction';
import type { OrderSubmissionBody } from './wallet-types';

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

it('Has the correct default state', () => {
  const { result } = setup();
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  expect(result.current.transaction.txHash).toEqual(null);
  expect(result.current.transaction.signature).toEqual(null);
  expect(result.current.transaction.error).toEqual(null);
  expect(typeof result.current.reset).toEqual('function');
  expect(typeof result.current.send).toEqual('function');
});

it('If provider returns null status should be default', async () => {
  const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(null));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmissionBody);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
});

it('Handles a single error', async () => {
  const errorMessage = 'Oops error!';
  const mockSendTx = jest
    .fn()
    .mockReturnValue(Promise.resolve({ error: errorMessage }));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmissionBody);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
  expect(result.current.transaction.error).toEqual({ error: errorMessage });
});

it('Handles multiple errors', async () => {
  const errorObj = {
    errors: {
      something: 'Went wrong!',
    },
  };
  const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(errorObj));
  const { result } = setup({ sendTx: mockSendTx });
  await act(async () => {
    result.current.send({} as OrderSubmissionBody);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
  expect(result.current.transaction.error).toEqual(errorObj);
});

it('Returns the signature if successful', async () => {
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
    result.current.send({} as OrderSubmissionBody);
  });
  expect(result.current.transaction.status).toEqual(VegaTxStatus.Pending);
  expect(result.current.transaction.txHash).toEqual(successObj.txHash);
  expect(result.current.transaction.signature).toEqual(
    successObj.tx.signature.value
  );
});
