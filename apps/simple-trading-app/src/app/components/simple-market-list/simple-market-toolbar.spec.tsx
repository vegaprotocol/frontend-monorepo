import React from 'react';
import { useLocation, useRoutes, BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import { markets as filterData } from './mocks/market-filters.json';

describe('SimpleMarketToolbar', () => {
  const WrappedCompForTest = () => {
    const routes = useRoutes([
      {
        path: '/',
        element: (
          <SimpleMarketToolbar data={filterData as SimpleMarkets_markets[]} />
        ),
      },
      {
        path: 'markets',
        children: [
          {
            path: `:state`,
            element: (
              <SimpleMarketToolbar
                data={filterData as SimpleMarkets_markets[]}
              />
            ),
            children: [
              {
                path: `:product`,
                element: (
                  <SimpleMarketToolbar
                    data={filterData as SimpleMarkets_markets[]}
                  />
                ),
                children: [
                  {
                    path: `:asset`,
                    element: (
                      <SimpleMarketToolbar
                        data={filterData as SimpleMarkets_markets[]}
                      />
                    ),
                  },
                ],
              },
            ],
          },
        ],
        element: (
          <SimpleMarketToolbar data={filterData as SimpleMarkets_markets[]} />
        ),
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
    render(
      <MockedProvider mocks={[]} addTypename={false}>
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

  it('navigation should work well', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
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
