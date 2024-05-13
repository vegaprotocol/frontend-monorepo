import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import NodeLink from './node-link';
import { ExplorerNodeDocument } from './__generated__/Node';

function renderComponent(id: string, mock: MockedResponse[]) {
  return (
    <MockedProvider mocks={mock}>
      <MemoryRouter>
        <NodeLink id={id} />
      </MemoryRouter>
    </MockedProvider>
  );
}

describe('Node link component', () => {
  const mock = {
    request: {
      query: ExplorerNodeDocument,
      variables: {
        id: '123',
      },
    },
    result: {
      data: {
        node: {
          id: '123',
          status: 'irrelevant-test-data',
          name: 'test-label',
        },
      },
    },
  };

  it('Renders the ID at first', () => {
    const res = render(renderComponent('123', [mock]));
    expect(res.getByText('123')).toBeInTheDocument();
  });

  it('Renders the node name when the query returns a result', async () => {
    const res = render(renderComponent('123', [mock]));
    expect(res.getByText('123')).toBeInTheDocument();
    expect(await res.findByText('test-label')).toBeInTheDocument();
  });

  it('Leaves the node id when the node is not found', async () => {
    const mock = {
      request: {
        query: ExplorerNodeDocument,
        variables: {
          id: '123',
        },
      },
      error: new Error('No such node'),
    };

    const res = render(renderComponent('123', [mock]));
    expect(await res.findByText('123')).toBeInTheDocument();
  });
});
