import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import { usePing } from '@/hooks/ping';
import { usePreventWindowResize } from '@/hooks/prevent-window-resize';
import { useGlobalsStore } from '@/stores/globals';
import { mockStore } from '@/test-helpers/mock-store';

import App from './app';

jest.mock('@/stores/globals');
jest.mock('@/hooks/prevent-window-resize');
jest.mock('@/hooks/listen-for-popups');
jest.mock('@/hooks/listen-for-active-tab');
jest.mock('@/hooks/ping');
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
jest.mock('@/stores/popover-store', () => ({
  usePopoverStore: (function_: any) => {
    return function_({
      setup: jest.fn(),
      teardown: jest.fn(),
    });
  },
}));

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
    expect(screen.getByTestId('network-provider')).toBeInTheDocument();
    expect(screen.getByTestId('json-rpc-provider')).toBeInTheDocument();
    expect(document.body.style.minHeight).toBe('600px');
  });

  it('calls global level hooks', () => {
    mockStore(useGlobalsStore, {
      isMobile: false,
    });
    render(<App />);
    expect(usePreventWindowResize).toHaveBeenCalled();
    // expect(usePing).toHaveBeenCalled();
  });

  it('does not add min width if the device is mobile', () => {
    mockStore(useGlobalsStore, {
      isMobile: true,
    });
    render(<App />);
    expect(document.body.style.minHeight).toBe('');
  });
});
