import React from 'react';
import { useLocation, useRoutes, BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { MockedResponse } from '@apollo/client/testing';
import type { MarketFilters } from './__generated__/MarketFilters';
import { FILTERS_QUERY } from './data-provider';
import filterData from './mocks/market-filters.json';
import { act } from 'react-dom/test-utils';

describe('SimpleMarketToolbar', () => {
  const filterMock: MockedResponse<MarketFilters> = {
    request: {
      query: FILTERS_QUERY,
    },
    result: {
      data: filterData as unknown as MarketFilters,
    },
  };

  const WrappedCompForTest = () => {
    const routes = useRoutes([
      {
        path: '/',
        element: <SimpleMarketToolbar />,
      },
      {
        path: 'markets',
        children: [
          {
            path: `:state`,
            element: <SimpleMarketToolbar />,
            children: [
              {
                path: `:product`,
                element: <SimpleMarketToolbar />,
                children: [
                  { path: `:asset`, element: <SimpleMarketToolbar /> },
                ],
              },
            ],
          },
        ],
        element: <SimpleMarketToolbar />,
      },
    ]);
    const location = useLocation();
    return (
      <>
        {routes}
        <div data-testid="location-display">{location.pathname}</div>
      </>
    );
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be properly rendered', async () => {
    act(async () => {
      render(
        // @ts-ignore different versions of react types in apollo and app
        <MockedProvider mocks={[filterMock]} addTypename={false}>
          <WrappedCompForTest />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
      await waitFor(() => {
        expect(screen.getByText('Future')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Future'));
      await waitFor(() => {
        expect(screen.getByTestId('market-products-menu').children).toHaveLength(
          3
        );
        expect(screen.getByTestId('market-assets-menu').children).toHaveLength(6);
      });
      fireEvent.click(screen.getByTestId('state-trigger'));
      waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByRole('menu').children).toHaveLength(10);
      });
    });
  });

  it('navigation should work well', async () => {
    act(async () => {

      render(
        // @ts-ignore different versions of react types in apollo and app
        <MockedProvider mocks={[filterMock]} addTypename={false}>
          <WrappedCompForTest />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );

      await waitFor(() => {
        expect(screen.getByText('Future')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Future'));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent(
          '/markets/Active/Future'
        );
      });

      fireEvent.click(
        screen
          .getByTestId('market-assets-menu')
          .children[5].querySelector('a') as HTMLAnchorElement
      );
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent(
          '/markets/Active/Future/tEURO'
        );
      });

      fireEvent.click(screen.getByTestId('state-trigger'));
      waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Pending'));
        expect(screen.getByTestId('location-display')).toHaveTextContent(
          '/markets/Pending/Future/tEURO'
        );
      });
    });
  });
});
