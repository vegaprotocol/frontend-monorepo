import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Web3ConnectDialog } from './web3-connect-dialog';
import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Connector } from '@web3-react/types';

const [foo, fooHooks] = initializeConnector((actions) => new MetaMask(actions));

const connectors: [Connector, Web3ReactHooks][] = [[foo, fooHooks]];

const props = {
  dialogOpen: false,
  setDialogOpen: jest.fn(),
  connectors,
  desiredChainId: 3,
};

it('Dialog can be open or closed', () => {
  const { container, rerender } = render(<Web3ConnectDialog {...props} />);
  expect(container).toBeEmptyDOMElement();
  rerender(<Web3ConnectDialog {...props} dialogOpen={true} />);
  expect(screen.getByTestId('web3-connector-list')).toBeInTheDocument();
  expect(
    screen.getByText('Connect to your Ethereum wallet')
  ).toBeInTheDocument();
});

it('Renders connection options', async () => {
  const spyOnConnect = jest
    .spyOn(foo, 'activate')
    .mockReturnValue(Promise.resolve());

  render(<Web3ConnectDialog {...props} dialogOpen={true} />);
  const connectorList = screen.getByTestId('web3-connector-list');
  expect(connectorList).toBeInTheDocument();
  expect(connectorList.children).toHaveLength(Object.keys(connectors).length);

  expect(screen.getByTestId('web3-connector-MetaMask')).toBeInTheDocument();

  // Assert connection is attempted with desired chain
  fireEvent.click(screen.getByTestId('web3-connector-MetaMask'));
  expect(spyOnConnect).toHaveBeenCalledWith(props.desiredChainId);
  await waitFor(() => {
    expect(props.setDialogOpen).toHaveBeenCalledWith(false);
  });
});
