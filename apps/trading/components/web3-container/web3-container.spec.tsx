import { fireEvent, render, screen } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { NETWORK_PARAMS_QUERY, Web3Container } from './web3-container';
import type { NetworkParamsQuery } from './__generated__/NetworkParamsQuery';
import type { useWeb3React } from '@web3-react/core';

const defaultHookValue = {
  isActive: false,
  error: undefined,
  connector: null,
  chainId: 3,
} as unknown as ReturnType<typeof useWeb3React>;
let mockHookValue: ReturnType<typeof useWeb3React>;

const mockEthereumConfig = {
  network_id: '3',
  chain_id: '3',
  confirmations: 3,
  collateral_bridge_contract: {
    address: 'bridge address',
  },
};

const networkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
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

jest.mock('@web3-react/core', () => {
  const original = jest.requireActual('@web3-react/core');
  return {
    ...original,
    useWeb3React: jest.fn(() => mockHookValue),
  };
});

function setup(mock = networkParamsQueryMock) {
  return render(
    <MockedProvider mocks={[mock]}>
      <Web3Container>
        {({ ethereumConfig }) => (
          <div>
            <div>Child</div>
            <div>{ethereumConfig.collateral_bridge_contract.address}</div>
          </div>
        )}
      </Web3Container>
    </MockedProvider>
  );
}

test('Prompt to connect opens dialog', async () => {
  mockHookValue = defaultHookValue;
  setup();

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(
    await screen.findByText('Connect your Ethereum wallet')
  ).toBeInTheDocument();

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(screen.queryByTestId('web3-connector-list')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('Connect'));
  expect(screen.getByTestId('web3-connector-list')).toBeInTheDocument();
});

test('Error message is shown', async () => {
  const message = 'Opps! An error';
  mockHookValue = { ...defaultHookValue, error: new Error(message) };
  setup();

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(await screen.findByText(`Something went wrong: ${message}`));
  expect(screen.queryByText('Child')).not.toBeInTheDocument();
});

test('Checks that chain ID matches app ID', async () => {
  const expectedChainId = 4;
  mockHookValue = {
    ...defaultHookValue,
    isActive: true,
    chainId: expectedChainId,
  };
  setup();

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(await screen.findByText(`This app only works on chain ID: 3`));
  expect(screen.queryByText('Child')).not.toBeInTheDocument();
});

test('Passes ethereum config to children', async () => {
  mockHookValue = {
    ...defaultHookValue,
    isActive: true,
  };
  setup();

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(
    await screen.findByText(
      mockEthereumConfig.collateral_bridge_contract.address
    )
  ).toBeInTheDocument();
});

test('Shows no config found message if the network parameter doesnt exist', async () => {
  const mock: MockedResponse<NetworkParamsQuery> = {
    request: {
      query: NETWORK_PARAMS_QUERY,
    },
    result: {
      data: {
        networkParameters: [
          {
            __typename: 'NetworkParameter',
            key: 'nope',
            value: 'foo',
          },
        ],
      },
    },
  };
  setup(mock);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(
    await screen.findByText('No ethereum config found')
  ).toBeInTheDocument();
});

test('Shows message if ethereum config could not be parsed', async () => {
  const mock: MockedResponse<NetworkParamsQuery> = {
    request: {
      query: NETWORK_PARAMS_QUERY,
    },
    result: {
      data: {
        networkParameters: [
          {
            __typename: 'NetworkParameter',
            key: 'blockchains.ethereumConfig',
            value: '"something invalid }',
          },
        ],
      },
    },
  };
  setup(mock);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(await screen.findByText('Could not parse config')).toBeInTheDocument();
});
