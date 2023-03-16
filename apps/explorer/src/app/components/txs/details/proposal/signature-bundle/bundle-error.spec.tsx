import type { ApolloError } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { BundleError } from './bundle-error';

describe('Bundle Error', () => {
  const NON_ENABLED_STATUS: AssetStatus[] = [
    AssetStatus.STATUS_PENDING_LISTING,
  ];

  const NOT_SHOWN_STATUS: AssetStatus[] = [
    AssetStatus.STATUS_PROPOSED,
    AssetStatus.STATUS_REJECTED,
  ];

  const ENABLED_STATUS: AssetStatus[] = [AssetStatus.STATUS_ENABLED];
  it.each(NOT_SHOWN_STATUS)(
    'does not render for proposed or rejected bundles',
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

      expect(screen.container).toBeEmptyDOMElement();
    }
  );
  it.each(NON_ENABLED_STATUS)(
    'shows the apollo error in a syntax highlighter if not enabled and a message is provided',
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

      expect(screen.getByText('No signature bundle')).toBeInTheDocument();
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

      expect(screen.getByText('No signature bundle')).toBeInTheDocument();
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
