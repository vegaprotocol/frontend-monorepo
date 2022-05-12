import { act, render, screen } from '@testing-library/react';
import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Web3Provider } from './web3-provider';

const [foo, fooHooks] = initializeConnector((actions) => new MetaMask(actions));

const connectors: [MetaMask, Web3ReactHooks][] = [[foo, fooHooks]];

it('Renders children', async () => {
  await act(async () => {
    render(
      <Web3Provider connectors={connectors}>
        <div>Child</div>
      </Web3Provider>
    );
  });

  expect(screen.getByText('Child')).toBeInTheDocument();
});
