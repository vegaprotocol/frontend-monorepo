import React from 'react';
import {
  useLocation,
  useRoutes,
  BrowserRouter,
  useParams,
} from 'react-router-dom';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  getAllByText,
} from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import { MarketState } from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/market-list';
import SimpleMarketToolbar from './simple-market-toolbar';
import { markets as filterData } from './mocks/market-filters.json';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom');
  return {
    ...actualRouter,
    useNavigate: () => mockedNavigate,
    useParams: jest.fn(() => actualRouter.useParams()),
  };
});

describe('SimpleMarketToolbar', () => {
  const WrappedCompForTest = () => {
    const routes = useRoutes([
      {
        path: '/',
        element: <SimpleMarketToolbar data={filterData as Market[]} />,
      },
      {
        path: 'markets',
        children: [
          {
            path: `:state`,
            element: <SimpleMarketToolbar data={filterData as Market[]} />,
            children: [
              {
                path: `:product`,
                element: <SimpleMarketToolbar data={filterData as Market[]} />,
                children: [
                  {
                    path: `:asset`,
                    element: (
                      <SimpleMarketToolbar data={filterData as Market[]} />
                    ),
                  },
                ],
              },
            ],
          },
        ],
        element: <SimpleMarketToolbar data={filterData as Market[]} />,
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
    jest.clearAllMocks();
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
    await waitFor(() => {
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
        `/markets/${MarketState.STATE_ACTIVE}/Future`
      );
    });

    fireEvent.click(
      screen
        .getByTestId('market-assets-menu')
        .children[5].querySelector('a') as HTMLAnchorElement
    );
    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        `/markets/${MarketState.STATE_ACTIVE}/Future/tEURO`
      );
    });

    fireEvent.click(screen.getByTestId('state-trigger'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const menu = screen.getByRole('menu');
    const pending = getAllByText(menu, 'Pending')[0];
    await act(() => {
      fireEvent.click(pending);
    });
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        `/markets/${MarketState.STATE_PENDING}/Future/tEURO`
      );
    });
  });

  it('stateChange callback should work well', async () => {
    (useParams as jest.Mock).mockImplementation(() => ({
      asset: 'asset1',
      product: 'product1',
      state: 'state1',
    }));
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SimpleMarketToolbar data={filterData as Market[]} />
      </MockedProvider>,
      { wrapper: BrowserRouter }
    );
    fireEvent.click(screen.getByTestId('state-trigger'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const menu = screen.getByRole('menu');
    const suspended = getAllByText(menu, 'Suspended')[0];
    fireEvent.click(suspended);

    expect(mockedNavigate).toHaveBeenCalledWith(
      `/markets/${MarketState.STATE_SUSPENDED}/product1/asset1`
    );
  });

  it('stateChange callback should call navigate with url with state only', async () => {
    (useParams as jest.Mock).mockImplementation(() => ({}));
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SimpleMarketToolbar data={filterData as Market[]} />
      </MockedProvider>,
      { wrapper: BrowserRouter }
    );
    fireEvent.click(screen.getByTestId('state-trigger'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const menu = screen.getByRole('menu');
    const closed = getAllByText(menu, 'Closed')[0];
    fireEvent.click(closed);

    expect(mockedNavigate).toHaveBeenCalledWith(
      `/markets/${MarketState.STATE_CLOSED}`
    );
  });

  it('stateChange callback should call navigate with no asset', async () => {
    (useParams as jest.Mock).mockImplementation(() => ({
      asset: 'all',
      state: 'state1',
    }));
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SimpleMarketToolbar data={filterData as Market[]} />
      </MockedProvider>,
      { wrapper: BrowserRouter }
    );
    fireEvent.click(screen.getByTestId('state-trigger'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const menu = screen.getByRole('menu');
    const active = getAllByText(menu, 'Active')[0];
    fireEvent.click(active);
    expect(mockedNavigate).toHaveBeenCalledWith('/markets');
  });
});
