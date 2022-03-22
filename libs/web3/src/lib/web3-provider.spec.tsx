import { act, render, screen } from '@testing-library/react';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Web3Provider } from './web3-provider';

const connectors = {
  foo: initializeConnector((actions) => new MetaMask(actions)),
};

test('Renders children', async () => {
  await act(async () => {
    render(
      <Web3Provider connectors={connectors}>
        <div>Child</div>
      </Web3Provider>
    );
  });

  expect(screen.getByText('Child')).toBeInTheDocument();
});
