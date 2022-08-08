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

const oneMinute = 1000 * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;
const oneWeek = oneDay * 7;
const oneMonth = oneWeek * 4;

export const fiveMinutes = new Date(oneMinute * 5);
export const fiveHours = new Date(oneHour * 5);
export const fiveDays = new Date(oneDay * 5);
export const lastWeek = new Date(-oneWeek);
export const nextWeek = new Date(oneWeek);
export const lastMonth = new Date(-oneMonth);
export const nextMonth = new Date(oneMonth);
