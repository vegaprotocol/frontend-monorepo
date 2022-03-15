import { act, renderHook } from '@testing-library/react-hooks';
import { OrderSubmissionBody } from '@vegaprotocol/vegawallet-service-api-client';
import {
  VegaKeyExtended,
  VegaWalletContext,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { ReactNode } from 'react';
import {
  Order,
  OrderSide,
  OrderTimeInForce,
  OrderType,
} from './use-order-state';
import { useOrderSubmit } from './use-order-submit';
import { VegaTxStatus } from './use-vega-transaction';

const defaultWalletContext = {
  keypair: null,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(
  context?: Partial<VegaWalletContextShape>,
  marketId = 'market-id'
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletContext.Provider value={{ ...defaultWalletContext, ...context }}>
      {children}
    </VegaWalletContext.Provider>
  );
  return renderHook(() => useOrderSubmit(marketId), { wrapper });
}

test('Has the correct default state', () => {
  const { result } = setup();
  expect(typeof result.current.submit).toEqual('function');
  expect(typeof result.current.setStatus).toEqual('function');
  expect(result.current.status).toEqual(VegaTxStatus.Default);
  expect(result.current.txHash).toEqual(undefined);
  expect(result.current.error).toEqual(null);
  expect(result.current.id).toEqual('');
});

test('Should not sendTx if no keypair', async () => {
  const mockSendTx = jest.fn();
  const { result } = setup({ sendTx: mockSendTx, keypairs: [], keypair: null });
  await act(async () => {
    result.current.submit({} as Order);
  });
  expect(mockSendTx).not.toHaveBeenCalled();
});

test('Should not sendTx side is not specified', async () => {
  const mockSendTx = jest.fn();
  const keypair = {
    pub: '0x123',
  } as VegaKeyExtended;
  const { result } = setup({
    sendTx: mockSendTx,
    keypairs: [keypair],
    keypair,
  });
  await act(async () => {
    result.current.submit({} as Order);
  });
  expect(mockSendTx).not.toHaveBeenCalled();
});

test('Create an Id if a signature is returned', async () => {
  const signature =
    '597a7706491e6523c091bab1e4d655b62c45a224e80f6cd92ac366aa5dd9a070cc7dd3c6919cb07b81334b876c662dd43bdbe5e827c8baa17a089feb654fab0b';
  const expectedId =
    '2FE09B0E2E6ED35F8883802629C7D609D3CC2FC9CE3CEC0B7824A0D581BD3747';
  const successObj = {
    tx: {
      inputData: 'input-data',
      signature: {
        algo: 'algo',
        version: 1,
        value: signature,
      },
    },
    txHash: '0x123',
  };
  const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(successObj));
  const keypair = {
    pub: '0x123',
  } as VegaKeyExtended;
  const { result } = setup({
    sendTx: mockSendTx,
    keypairs: [keypair],
    keypair,
  });
  await act(async () => {
    result.current.submit({
      type: OrderType.Market,
      side: OrderSide.Buy,
      size: '1',
      timeInForce: OrderTimeInForce.FOK,
    });
  });
  expect(result.current.id).toEqual(expectedId);
});
