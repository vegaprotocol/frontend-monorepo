import { act, fireEvent, render, screen } from '@testing-library/react';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Web3Provider } from './web3-provider';

test('Shows connection options in a modal', async () => {
  const connectors = {
    foo: initializeConnector((actions) => new MetaMask(actions)),
    bar: initializeConnector((actions) => new MetaMask(actions)),
  };
  render(
    <Web3Provider connectors={connectors}>
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
});
