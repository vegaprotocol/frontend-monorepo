import { act, fireEvent, render, screen } from '@testing-library/react';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Web3Provider } from './web3-provider';

const connectors = {
  foo: initializeConnector((actions) => new MetaMask(actions)),
  bar: initializeConnector((actions) => new MetaMask(actions)),
};

const props = {
  connectors,
  appChainId: 1,
};

test('Can connect via connector options in a modal', async () => {
  const spyOnConnect = jest.spyOn(connectors.foo[0], 'activate');

  render(
    <Web3Provider {...props}>
      <div>Child</div>
    </Web3Provider>
  );

  // Doesnt render
  expect(screen.queryByText('Child')).not.toBeInTheDocument();

  await act(async () => {
    fireEvent.click(screen.getByRole('button'));
  });

  const connectorList = screen.getByTestId('web3-connector-list');
  expect(connectorList).toBeInTheDocument();
  expect(connectorList.children).toHaveLength(Object.keys(connectors).length);

  // foo/bar connector options displayed
  expect(screen.getByTestId('web3-connector-foo')).toBeInTheDocument();
  expect(screen.getByTestId('web3-connector-bar')).toBeInTheDocument();

  // Assert connection is attempted with desired chain
  fireEvent.click(screen.getByTestId('web3-connector-foo'));
  expect(spyOnConnect).toHaveBeenCalledWith(props.appChainId);
});
