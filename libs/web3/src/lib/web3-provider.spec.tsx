import { type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { Web3Provider } from './web3-provider';
import { createConnectors } from './connectors';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    ETHEREUM_CHAIN_ID: 11155111,
    ETHEREUM_RPC_URLS: { 1115511: 'https://foo.com' },
  }),
  ENV: {
    ETHEREUM_CHAIN_ID: 11155111,
    ETHEREUM_RPC_URLS: { 11155111: 'https://foo.com' },
  },
}));

jest.mock('@web3-react/core', () => ({
  ...jest.requireActual('@web3-react/core'),
  Web3ReactProvider: ({ children }: { children: ReactNode }) => children,
}));

it('starts fallback connector on correct chain', async () => {
  const connectors = createConnectors();

  const spy = jest.spyOn(connectors[connectors.length - 1][0], 'activate');

  render(
    <Web3Provider connectors={connectors}>
      <div>Child</div>
    </Web3Provider>
  );

  expect(screen.getByText('Child')).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith(11155111);
});
