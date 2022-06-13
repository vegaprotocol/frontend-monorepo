import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { MockedResponse } from '@apollo/client/testing';
import type { MarketFilters } from './__generated__/MarketFilters';
import { FILTERS_QUERY } from './data-provider';
import filterData from './mocks/market-filters.json';
import { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import { InMemoryCache } from '@apollo/client';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}));

describe('SimpleMarketToolbar', () => {
  const cache = new InMemoryCache({
    typePolicies: {
      Rocket: {
        fields: {
          description: {
            read() {
              // Read function for Rocket.description
              return 'Placeholder rocket description';
            },
          },
        },
      },
    },
  });

  const filterMock: MockedResponse<MarketFilters> = {
    request: {
      query: FILTERS_QUERY,
    },
    result: {
      data: filterData as unknown as MarketFilters,
    },
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be properly rendered', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[filterMock]} addTypename={false}>
          <SimpleMarketToolbar />
        </MockedProvider>
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('market-products-menu').children).toHaveLength(3);
    expect(screen.getByTestId('market-assets-menu').children).toHaveLength(6);
    expect(screen.getByRole('combobox').children).toHaveLength(10);
  });
});
