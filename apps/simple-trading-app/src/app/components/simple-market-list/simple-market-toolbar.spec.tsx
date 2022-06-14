import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { MockedResponse } from '@apollo/client/testing';
import type { MarketFilters } from './__generated__/MarketFilters';
import { FILTERS_QUERY } from './data-provider';
import filterData from './mocks/market-filters.json';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useParams: () => ({}),
}));

describe('SimpleMarketToolbar', () => {
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

  it('navigation should work well', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[filterMock]} addTypename={false}>
          <SimpleMarketToolbar />
        </MockedProvider>
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    fireEvent.click(
      screen
        .getByTestId('market-products-menu')
        .children[1].querySelector('button') as HTMLButtonElement
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/markets/Active/all/Future');

    fireEvent.click(
      screen
        .getByTestId('market-assets-menu')
        .children[5].querySelector('button') as HTMLButtonElement
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/markets/Active/tEURO/Future');

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Pending' },
    });
    expect(mockedNavigate).toHaveBeenCalledWith(
      '/markets/Pending/tEURO/Future'
    );
  });
});
