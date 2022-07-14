import { NETWORK_PARAMS_QUERY } from '@vegaprotocol/web3';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import type { MockedResponse } from '@apollo/client/testing';
import type { NetworkParamsQuery } from '@vegaprotocol/web3';

export const mockPubkey = '0x123';
const mockKeypair = {
  pub: mockPubkey,
} as VegaKeyExtended;

export const mockWalletContext = {
  keypair: mockKeypair,
  keypairs: [mockKeypair],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

const mockEthereumConfig = {
  network_id: '3',
  chain_id: '3',
  confirmations: 3,
  collateral_bridge_contract: {
    address: 'bridge address',
  },
};

export const networkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NETWORK_PARAMS_QUERY,
  },
  result: {
    data: {
      networkParameters: [
        {
          __typename: 'NetworkParameter',
          key: 'blockchains.ethereumConfig',
          value: JSON.stringify(mockEthereumConfig),
        },
      ],
    },
  },
};

export const amendToDate = (amendmentInSeconds: number) => {
  const now = new Date();
  return new Date(now.getTime() + amendmentInSeconds * 1000);
};

const oneWeek = 60 * 60 * 24 * 7;

export const lastMonth = amendToDate(-(oneWeek * 4));
export const lastWeek = amendToDate(-oneWeek);
export const nextWeek = amendToDate(oneWeek);
export const nextMonth = amendToDate(oneWeek * 4);
