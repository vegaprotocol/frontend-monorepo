import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';

import { locators } from '@/components/header';
import { useConnectionStore } from '@/stores/connections';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { ConnectionDetails } from './details';
jest.mock('./sections/automatic-consent', () => ({
  AutomaticConsentSection: () => <div data-testid="automatic-consent" />,
}));
jest.mock('./sections/delete-connection', () => ({
  DeleteConnectionSection: () => <div data-testid="delete-connection" />,
}));
jest.mock('./sections/details-list', () => ({
  DetailsSection: () => <div data-testid="details-list" />,
}));

jest.mock('@/stores/connections');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <ConnectionDetails />
    </MemoryRouter>
  );
};

describe('ConnectionDetails', () => {
  it('throws error if id parameter is not defined', () => {
    silenceErrors();
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    expect(() => renderComponent()).toThrow(
      'Id param not provided to connection details'
    );
  });
  it('throws error if connection could not be found', () => {
    (useParams as jest.Mock).mockReturnValue({ id: encodeURI('test') });
    mockStore(useConnectionStore, { connections: [] });
    expect(() => renderComponent()).toThrow(
      'Could not find connection with origin test'
    );
  });
  it('returns null while loading', () => {
    (useParams as jest.Mock).mockReturnValue({ id: encodeURI('test') });
    mockStore(useConnectionStore, { connections: [], loading: true });
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });
  it('renders all sections & title', () => {
    (useParams as jest.Mock).mockReturnValue({
      id: encodeURI('https://foo.com'),
    });
    mockStore(useConnectionStore, {
      connections: [
        {
          origin: 'https://foo.com',
          accessedAt: 0,
          chainId: 'chainId',
          networkId: 'networkId',
          allowList: {
            publicKeys: [],
            wallets: [],
          },
          autoConsent: false,
        },
      ],
    });
    renderComponent();
    expect(screen.getByTestId('automatic-consent')).toBeInTheDocument();
    expect(screen.getByTestId('delete-connection')).toBeInTheDocument();
    expect(screen.getByTestId('details-list')).toBeInTheDocument();
    expect(screen.getByTestId(locators.header)).toHaveTextContent('foo.com');
  });

  it('renders origin if cannot parse', () => {
    (useParams as jest.Mock).mockReturnValue({
      id: encodeURI('not-a-valid-url'),
    });
    mockStore(useConnectionStore, {
      connections: [
        {
          origin: 'not-a-valid-url',
          accessedAt: 0,
          chainId: 'chainId',
          networkId: 'networkId',
          allowList: {
            publicKeys: [],
            wallets: [],
          },
          autoConsent: false,
        },
      ],
    });
    renderComponent();
    expect(screen.getByTestId(locators.header)).toHaveTextContent(
      'not-a-valid-url'
    );
  });
});
