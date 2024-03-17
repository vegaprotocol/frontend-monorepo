import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Web3ConnectDialog } from './web3-connect-dialog';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { connectors } from './connectors';
import {
  NetworkParamsDocument,
  type NetworkParamsQuery,
} from '@vegaprotocol/network-parameters';

jest.mock('@vegaprotocol/environment', () => ({
  ENV: {
    ETHEREUM_CHAIN_ID: 1440,
    ETHEREUM_RPC_URLS: { 1440: 'https://foo.com' },
  },
}));

jest.mock('@web3-react/walletconnect', () => ({
  WalletConnect: function () {
    return { activate: jest.fn() };
  },
}));

jest.mock('@web3-react/walletconnect-v2', () => ({
  WalletConnect: function () {
    return { activate: jest.fn() };
  },
}));

const defaultProps = {
  dialogOpen: false,
  setDialogOpen: jest.fn(),
};

const mockChainId = 1440;
const mockEthereumConfig: MockedResponse<NetworkParamsQuery, never> = {
  request: {
    query: NetworkParamsDocument,
  },
  result: {
    data: {
      networkParametersConnection: {
        edges: [
          {
            node: {
              key: 'blockchains.ethereumConfig',
              value: JSON.stringify({ chain_id: mockChainId }),
            },
          },
        ],
      },
    },
  },
};

const renderComponent = (props?: Partial<typeof defaultProps>) => (
  <MockedProvider mocks={[mockEthereumConfig]}>
    <Web3ConnectDialog {...defaultProps} {...props} />
  </MockedProvider>
);

it('Dialog can be open or closed', () => {
  const { container, rerender } = render(renderComponent());
  expect(container).toBeEmptyDOMElement();
  rerender(renderComponent({ dialogOpen: true }));
  expect(screen.getByTestId('web3-connector-list')).toBeInTheDocument();
  expect(
    screen.getByText('Connect to your Ethereum wallet')
  ).toBeInTheDocument();
});

it('Renders connection options', async () => {
  const user = userEvent.setup();
  const mockSetDialog = jest.fn();
  const spyOnConnect = jest
    .spyOn(connectors[0][0], 'activate')
    .mockReturnValue(Promise.resolve());

  render(renderComponent({ dialogOpen: true, setDialogOpen: mockSetDialog }));

  const connectorList = await screen.findByTestId('web3-connector-list');
  expect(connectorList).toBeInTheDocument();
  expect(connectorList.children).toHaveLength(connectors.length - 1);

  // Assert connection is attempted with desired chain
  await user.click(screen.getByTestId('web3-connector-MetaMask'));
  expect(spyOnConnect).toHaveBeenCalledWith(mockChainId);

  await waitFor(() => {
    expect(mockSetDialog).toHaveBeenCalledWith(false);
  });
});
