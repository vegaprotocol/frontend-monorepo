import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Markets from './index';
import type { MockedResponse } from '@apollo/client/testing';
import { ExplorerMarketsDocument } from './__generated__/Markets';

function renderComponent(mock: MockedResponse[]) {
  return (
    <MemoryRouter>
      <MockedProvider mocks={mock}>
        <Markets />
      </MockedProvider>
    </MemoryRouter>
  );
}

describe('Markets index', () => {
  it('Renders loader when loading', async () => {
    const mock = {
      request: {
        query: ExplorerMarketsDocument,
      },
      result: {
        data: {
          marketsConnection: [],
        },
      },
    };
    const res = render(renderComponent([mock]));
    expect(await res.findByTestId('loader')).toBeInTheDocument();
  });

  it('Renders EmptyList when loading completes and there are no results', async () => {
    const mock = {
      request: {
        query: ExplorerMarketsDocument,
      },
      result: {
        data: {
          marketsConnection: [],
        },
      },
    };
    const res = render(renderComponent([mock]));
    expect(await res.findByTestId('emptylist')).toBeInTheDocument();
  });
});
