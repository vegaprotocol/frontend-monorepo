import type { ApolloError } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { BundleError } from './bundle-error';

describe('Bundle Error', () => {
  const NON_ENABLED_STATUS: AssetStatus[] = [
    AssetStatus.STATUS_PENDING_LISTING,
    AssetStatus.STATUS_PROPOSED,
    AssetStatus.STATUS_REJECTED
  ];

  const ENABLED_STATUS: AssetStatus[] = [AssetStatus.STATUS_ENABLED];

  it.each(NON_ENABLED_STATUS)(
    'shows the apollo error if not enabled and a message is provided',
    (status) => {
      const screen = render(
        <MemoryRouter>
          <MockedProvider>
            <BundleError
              error={{ message: 'test-error-message' } as ApolloError}
              status={status}
            />
          </MockedProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('test-error-message')).toBeInTheDocument();
    }
  );

  it.each(NON_ENABLED_STATUS)(
    'shows some fallback error message if the bundle has not been used and there is no error',
    (status) => {
      const screen = render(
        <MemoryRouter>
          <MockedProvider>
            <BundleError status={status} />
          </MockedProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('No bundle for proposal ID')).toBeInTheDocument();
    }
  );

  it.each(ENABLED_STATUS)(
    'hides ProposalLink if the status is enabled',
    (status) => {
      const screen = render(
        <MemoryRouter>
          <MockedProvider>
            <BundleError
              error={{ message: 'irrelevant ' } as ApolloError}
              status={status}
            />
          </MockedProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Asset already enabled')).toBeInTheDocument();
    }
  );
});
