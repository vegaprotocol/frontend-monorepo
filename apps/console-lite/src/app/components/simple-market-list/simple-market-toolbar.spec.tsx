import React from 'react';
import { useLocation, useRoutes, BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import { markets as filterData } from './mocks/market-filters.json';
import * as Router from 'react-router-dom';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

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
        '/markets/STATE_ACTIVE/Future'
      );
    });

    fireEvent.click(
      screen
        .getByTestId('market-assets-menu')
        .children[5].querySelector('a') as HTMLAnchorElement
    );
    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        '/markets/STATE_ACTIVE/Future/tEURO'
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

  it('stateChange callback should work well', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({
      asset: 'asset1',
      product: 'product1',
      state: 'state1',
    });
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SimpleMarketToolbar data={filterData as SimpleMarkets_markets[]} />
      </MockedProvider>,
      { wrapper: BrowserRouter }
    );
    fireEvent.click(screen.getByTestId('state-trigger'));
    waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Suspended'));

      expect(mockedNavigate).toHaveBeenCalledWith(
        '/markets/STATE_SUSPENDED/product1/asset1'
      );
    });
  });

  it('stateChange callback should call navigate with url with state only', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({});
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SimpleMarketToolbar data={filterData as SimpleMarkets_markets[]} />
      </MockedProvider>,
      { wrapper: BrowserRouter }
    );
    fireEvent.click(screen.getByTestId('state-trigger'));
    waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Closed'));

      expect(mockedNavigate).toHaveBeenCalledWith('/markets/STATE_CLOSED');
    });
  });

  it('stateChange callback should call navigate with no asset', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({
      product: 'product1',
      asset: 'all',
      state: 'state1',
    });
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SimpleMarketToolbar data={filterData as SimpleMarkets_markets[]} />
      </MockedProvider>,
      { wrapper: BrowserRouter }
    );
    fireEvent.click(screen.getByTestId('state-trigger'));
    waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.click(screen.getByText('All'));
      expect(mockedNavigate).toHaveBeenCalledWith('/markets');
    });
  });
});
