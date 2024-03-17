import { type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { Web3Provider } from './web3-provider';
import { fallbackConnector } from './connectors';

jest.mock('./connectors', () => {
  const network = {
    activate: jest.fn(),
  };
  return {
    connectors: [],
    fallbackConnector: network,
  };
});

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    ETHEREUM_CHAIN_ID: 1440,
  }),
}));

jest.mock('@web3-react/core', () => ({
  Web3ReactProvider: ({ children }: { children: ReactNode }) => children,
}));

it('starts fallback connector on correct chain', async () => {
  const spy = jest.spyOn(fallbackConnector, 'activate');

  render(
    <Web3Provider>
      <div>Child</div>
    </Web3Provider>
  );

  expect(screen.getByText('Child')).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith(1440);
});
