import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// import { locators as hostImageLocators } from '@/components/host-image';

import {
  ConnectionsList,
  type ConnectionsListProperties,
  locators,
} from './connection-list';

const renderComponent = (properties: ConnectionsListProperties) => {
  render(
    <MemoryRouter>
      <ConnectionsList {...properties} />
    </MemoryRouter>
  );
};

describe('ConnectionList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2021-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders list of connections passed in with image', () => {
    renderComponent({
      connections: [
        {
          allowList: {
            publicKeys: [],
            wallets: ['Wallet 1'],
          },
          accessedAt: Date.now(),
          origin: 'https://vega.xyz',
          chainId: 'foo',
          networkId: 'bar',
          autoConsent: false,
        },
        {
          allowList: {
            publicKeys: [],
            wallets: ['Wallet 1'],
          },
          accessedAt: Date.now(),
          origin: 'foo.com',
          chainId: 'foo',
          networkId: 'bar',
          autoConsent: false,
        },
      ],
    });
    const connections = screen.getAllByTestId(locators.connectionOrigin);
    expect(connections).toHaveLength(2);
    const [vega, foo] = connections;
    expect(vega).toHaveTextContent('https://vega.xyz');
    expect(foo).toHaveTextContent('foo.com');
    // const images = screen.getAllByTestId(hostImageLocators.hostImage);
    // expect(images).toHaveLength(2);
  });
});
