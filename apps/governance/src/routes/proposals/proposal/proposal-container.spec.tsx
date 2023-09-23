import { render, screen, waitFor } from '@testing-library/react';
import { ProposalContainer } from './proposal-container';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ProposalQuery } from './__generated__/Proposal';
import { ProposalDocument } from './__generated__/Proposal';
import { generateProposal } from '../test-helpers/generate-proposals';

// Mock Custom Components
jest.mock('../components/proposal', () => ({
  Proposal: () => <div data-testid="proposal" />,
}));

jest.mock('../components/proposal-not-found', () => ({
  ProposalNotFound: () => <div data-testid="proposal-not-found" />,
}));

const renderComponent = (
  proposal: ProposalQuery['proposal'] | null,
  id: string
) => {
  return render(
    <MemoryRouter initialEntries={[`/governance/${id}`]}>
      <MockedProvider
        mocks={[
          {
            request: {
              query: ProposalDocument,
              variables: {
                proposalId: id,
                includeNewMarketProductField: false,
              },
            },
            result: { data: { proposal } },
          },
        ]}
      >
        <Routes>
          <Route
            path="/governance/:proposalId"
            element={<ProposalContainer />}
          />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('<ProposalContainer />', () => {
  it('renders <ProposalNotFound> if the proposal is not found', async () => {
    renderComponent(null, 'foo');
    await waitFor(() => {
      expect(screen.getByTestId('proposal-not-found')).toBeInTheDocument();
    });
  });

  it('renders <Proposal> if proposal is found', async () => {
    const proposal = generateProposal({ id: 'foo' });
    renderComponent(proposal as ProposalQuery['proposal'], 'foo');
    await waitFor(() => {
      expect(screen.getByTestId('proposal')).toBeInTheDocument();
    });
  });

  // Add more test cases as needed
});
