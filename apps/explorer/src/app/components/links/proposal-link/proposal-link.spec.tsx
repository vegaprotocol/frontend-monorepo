import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import ProposalLink from './proposal-link';
import { ExplorerProposalDocument } from './__generated__/Proposal';
import { GraphQLError } from 'graphql';

function renderComponent(id: string, mocks: MockedResponse[]) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ProposalLink id={id} />
      </MemoryRouter>
    </MockedProvider>
  );
}

describe('Proposal link component', () => {
  it('Renders the ID at first', () => {
    const res = render(renderComponent('123', []));
    expect(res.getByText('123')).toBeInTheDocument();
  });

  it('Renders the ID on error', async () => {
    const mock = {
      request: {
        query: ExplorerProposalDocument,
        variables: {
          id: '456',
        },
      },
      result: {
        errors: [new GraphQLError('No such proposal')],
      },
    };
    const res = render(renderComponent('456', [mock]));
    // The ID
    expect(res.getByText('456')).toBeInTheDocument();
  });

  it('Renders the proposal title when the query returns a result', async () => {
    const mock = {
      request: {
        query: ExplorerProposalDocument,
        variables: {
          id: '123',
        },
      },
      result: {
        data: {
          proposal: {
            id: '123',
            rationale: {
              title: 'test-title',
              description: 'test description',
            },
          },
        },
      },
    };

    const res = render(renderComponent('123', [mock]));
    expect(res.getByText('123')).toBeInTheDocument();
    expect(await res.findByText('test-title')).toBeInTheDocument();
  });

  it('Leaves the proposal id when the market is not found', async () => {
    const mock = {
      request: {
        query: ExplorerProposalDocument,
        variables: {
          id: '123',
        },
      },
      error: new Error('No such asset'),
    };

    const res = render(renderComponent('123', [mock]));
    expect(await res.findByText('123')).toBeInTheDocument();
  });
});
