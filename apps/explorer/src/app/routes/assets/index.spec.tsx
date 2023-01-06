import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Assets from './index';
import type { MockedResponse } from '@apollo/client/testing';
import { ExplorerAssetDocument } from '../../components/links/asset-link/__generated__/Asset';

function renderComponent(mock: MockedResponse[]) {
  return (
    <MemoryRouter>
      <MockedProvider mocks={mock}>
        <Assets />
      </MockedProvider>
    </MemoryRouter>
  );
}

describe('Assets index', () => {
  it('Renders loader when loading', async () => {
    const mock = {
      request: {
        query: ExplorerAssetDocument,
      },
      result: {
        data: {},
      },
    };
    const res = render(renderComponent([mock]));
    expect(await res.findByTestId('loader')).toBeInTheDocument();
  });

  it('Renders EmptyList when loading completes and there are no results', async () => {
    const mock = {
      request: {
        query: ExplorerAssetDocument,
      },
      result: {
        data: {},
      },
    };
    const res = render(renderComponent([mock]));
    expect(await res.findByTestId('emptylist')).toBeInTheDocument();
  });
});
