import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Web3ConnectDialog } from './web3-connect-dialog';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

const connectors = {
  foo: initializeConnector((actions) => new MetaMask(actions)),
  bar: initializeConnector((actions) => new MetaMask(actions)),
};

const props = {
  dialogOpen: false,
  setDialogOpen: jest.fn(),
  connectors,
  desiredChainId: 3,
};

test('Dialog can be open or closed', () => {
  const { container, rerender } = render(<Web3ConnectDialog {...props} />);
  expect(container).toBeEmptyDOMElement();
  rerender(<Web3ConnectDialog {...props} dialogOpen={true} />);
  expect(screen.getByTestId('web3-connector-list')).toBeInTheDocument();
  expect(
    screen.getByText('Connect to your Ethereum wallet')
  ).toBeInTheDocument();
});

test('Renders connection options', async () => {
  const spyOnConnect = jest
    .spyOn(connectors.foo[0], 'activate')
    .mockReturnValue(Promise.resolve());

  render(<Web3ConnectDialog {...props} dialogOpen={true} />);
  const connectorList = screen.getByTestId('web3-connector-list');
  expect(connectorList).toBeInTheDocument();
  expect(connectorList.children).toHaveLength(Object.keys(connectors).length);

  // foo/bar connector options displayed
  expect(screen.getByTestId('web3-connector-foo')).toBeInTheDocument();
  expect(screen.getByTestId('web3-connector-bar')).toBeInTheDocument();

  // Assert connection is attempted with desired chain
  fireEvent.click(screen.getByTestId('web3-connector-foo'));
  expect(spyOnConnect).toHaveBeenCalledWith(props.desiredChainId);
  await waitFor(() => {
    expect(props.setDialogOpen).toHaveBeenCalledWith(false);
  });
});
