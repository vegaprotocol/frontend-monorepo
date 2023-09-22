import { render, screen, waitFor } from '@testing-library/react';
import { generateProposal } from '../test-helpers/generate-proposals';
import type { ProposalQuery } from './__generated__/Proposal';
import { ProposalContainer } from './proposal-container';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProposalDocument } from './__generated__/Proposal';

jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn(() => ({ data: [], loading: false })),
}));

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
  return (
    <MemoryRouter initialEntries={[`/governance/${id}`]}>
      <MockedProvider
        mocks={[
          {
            request: {
              query: ProposalDocument,
              variables: {
                proposalId: id,
              },
            },
            result: { data: { proposal } },
          },
        ]}
      >
        <Routes>
          <Route
            path={`/governance/:proposalId`}
            element={<ProposalContainer />}
          />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('Proposal container', () => {
  it('Renders not found if the proposal is not found', async () => {
    render(renderComponent(null, 'foo'));
    await waitFor(() => {
      expect(screen.getByTestId('proposal-not-found')).toBeInTheDocument();
    });
  });

  it('Renders proposal details if proposal is found', async () => {
    const proposal = generateProposal({ id: 'foo' });
    render(renderComponent(proposal as ProposalQuery['proposal'], 'foo'));
    await waitFor(() => {
      expect(screen.getByTestId('proposal')).toBeInTheDocument();
    });
  });
});
