import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import MarketLink from './market-link';
import { ExplorerMarketDocument } from './__generated__/Market';
import { GraphQLError } from 'graphql';

function renderComponent(id: string, mocks: MockedResponse[]) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <MarketLink id={id} />
      </MemoryRouter>
    </MockedProvider>
  );
}

describe('Market link component', () => {
  it('Renders the ID at first', () => {
    const res = render(renderComponent('123', []));
    expect(res.getByText('123')).toBeInTheDocument();
  });

  it('Renders the ID with an emoji on error', async () => {
    const mock = {
      request: {
        query: ExplorerMarketDocument,
        variables: {
          id: '456',
        },
      },
      result: {
        errors: [new GraphQLError('No such market')],
      },
    };
    const res = render(renderComponent('456', [mock]));
    // The ID
    expect(res.getByText('456')).toBeInTheDocument();

    // The emoji
    expect(await res.findByRole('img')).toBeInTheDocument();
  });

  it('Renders the market name when the query returns a result', async () => {
    const mock = {
      request: {
        query: ExplorerMarketDocument,
        variables: {
          id: '123',
        },
      },
      result: {
        data: {
          market: {
            id: '123',
            decimalPlaces: 5,
            positionDecimalPlaces: 2,
            state: 'irrelevant-test-data',
            tradableInstrument: {
              instrument: {
                name: 'test-label',
                product: {
                  __typename: 'Future',
                  quoteName: 'dai',
                  settlementAsset: {
                    decimals: 8,
                  },
                },
              },
            },
          },
        },
      },
    };

    const res = render(renderComponent('123', [mock]));
    expect(res.getByText('123')).toBeInTheDocument();
    expect(await res.findByText('test-label')).toBeInTheDocument();
  });

  it('Leaves the market id when the market is not found', async () => {
    const mock = {
      request: {
        query: ExplorerMarketDocument,
        variables: {
          id: '123',
        },
      },
      error: new Error('No such market'),
    };

    const res = render(renderComponent('123', [mock]));
    expect(await res.findByTitle('123')).toBeInTheDocument();
  });
});
