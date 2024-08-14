import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useGlobalsStore } from '@/stores/globals';
import { mockStore } from '@/test-helpers/mock-store';

import App from './app';

jest.mock('javascript-time-ago', () => ({
  addDefaultLocale: jest.fn(),
}));
jest.mock('@vegaprotocol/browser-wallet-backend', () => ({
  createWalletBackend: jest.fn(),
}));
jest.mock('@/stores/globals');
jest.mock('@/contexts/network/network-provider', () => ({
  NetworkProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="network-provider">{children}</div>
  ),
}));

jest.mock(
  '@/components/global-error-boundary',
  () =>
    ({ children }: { children: ReactNode }) =>
      <div data-testid="global-error-boundary">{children}</div>
);

jest.mock('@/components/global-error-boundary', () => ({
  GlobalErrorBoundary: ({ children }: { children: ReactNode }) => (
    <div data-testid="global-error-boundary">{children}</div>
  ),
}));

jest.mock('@/contexts/json-rpc/json-rpc-provider', () => ({
  JsonRPCProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="json-rpc-provider">{children}</div>
  ),
}));

jest.mock('./routes', () => ({
  Routing: ({ children }: { children: ReactNode }) => (
    <div data-testid="routing">{children}</div>
  ),
}));

describe('App', () => {
  it('renders routing, error boundary, network provider and jsonrpcprovider', () => {
    mockStore(useGlobalsStore, {
      isMobile: false,
    });
    Object.defineProperty(window, 'resizeTo', { value: jest.fn() });

    render(<App />);
    expect(screen.getByTestId('global-error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('routing')).toBeInTheDocument();
    expect(screen.getByTestId('json-rpc-provider')).toBeInTheDocument();
  });
});
