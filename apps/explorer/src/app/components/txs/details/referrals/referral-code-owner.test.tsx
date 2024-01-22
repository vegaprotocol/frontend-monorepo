import { render, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { ReferralCodeOwner } from './referral-code-owner';
import type { ReferralCodeOwnerProps } from './referral-code-owner';
import { ExplorerReferralCodeOwnerDocument } from './__generated__/code-owner';
const renderComponent = (
  props: ReferralCodeOwnerProps,
  mocks: MockedResponse[]
) => {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <ReferralCodeOwner {...props} />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('ReferralCodeOwner', () => {
  it('should render loading state', () => {
    const mocks = [
      {
        request: {
          query: ExplorerReferralCodeOwnerDocument,
          variables: {
            id: 'ABC123',
          },
        },
      },
    ];

    const { getByText } = renderComponent({ code: 'ABC123' }, mocks);

    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    const errorMessage = 'Error fetching referrer: ABC123';
    const mocks = [
      {
        request: {
          query: ExplorerReferralCodeOwnerDocument,
          variables: {
            id: 'ABC123',
          },
        },
        error: new Error('nope'),
      },
    ];
    const { getByText } = renderComponent({ code: 'ABC123' }, mocks);

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should render link to referring party', async () => {
    const referrerId = 'DEF789';

    const mocks = [
      {
        request: {
          query: ExplorerReferralCodeOwnerDocument,
          variables: {
            id: 'ABC123',
          },
        },
        result: {
          data: {
            referralSets: {
              edges: [
                {
                  node: {
                    __typename: 'ReferralSet',
                    referrer: referrerId,
                    createdAt: '123',
                    updatedAt: '456',
                  },
                },
              ],
            },
          },
        },
      },
    ];

    const { getByText } = renderComponent({ code: 'ABC123' }, mocks);

    await waitFor(() => {
      expect(getByText(referrerId)).toBeInTheDocument();
    });
  });
});
