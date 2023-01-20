/*
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import AssetLink from './asset-link';
import { ExplorerAssetDocument } from './__generated__/Asset';

function renderComponent(id: string, mock: MockedResponse[]) {
  return (
    <MockedProvider mocks={mock}>
      <MemoryRouter>
        <AssetLink id={id} />
      </MemoryRouter>
    </MockedProvider>
  );
}

describe('Asset link component', () => {
  it('Renders the ID at first', () => {
    const res = render(renderComponent('123', []));
    expect(res.getByText('123')).toBeInTheDocument();
  });

  it('Renders the asset name when the query returns a result', async () => {
    const mock = {
      request: {
        query: ExplorerAssetDocument,
        variables: {
          id: '123',
        },
      },
      result: {
        data: {
          asset: {
            id: '123',
            name: 'test-label',
            status: 'irrelevant-test-data',
            decimals: 18,
          },
        },
      },
    };

    const res = render(renderComponent('123', [mock]));
    expect(res.getByText('123')).toBeInTheDocument();
    expect(await res.findByText('test-label')).toBeInTheDocument();
  });

  it('Leaves the asset id when the asset is not found', async () => {
    const mock = {
      request: {
        query: ExplorerAssetDocument,
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
*/
