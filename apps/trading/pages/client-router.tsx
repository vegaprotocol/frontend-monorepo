import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import trimEnd from 'lodash/trimEnd';
import { LayoutWithSidebar } from '../components/layouts';
import { LayoutCentered } from '../components/layouts/layout-centered';
import { Home } from '../client-pages/home';
import { Liquidity } from '../client-pages/liquidity';
import { MarketsPage } from '../client-pages/markets';
import { Disclaimer } from '../client-pages/disclaimer';
import { Transact } from '../client-pages/transact';
import { Deposit } from '../client-pages/deposit';
import { Withdraw } from '../client-pages/withdraw';
import { Transfer } from '../client-pages/transfer';

// These must remain dynamically imported as pennant cannot be compiled by nextjs due to ESM
// Using dynamic imports is a workaround for this until pennant is published as ESM
const MarketPage = lazy(() => import('../client-pages/market'));
const Portfolio = lazy(() => import('../client-pages/portfolio'));

// Make all route paths 'absolute' for easier
// href creation
export const Routes = {
  HOME: '/',
  MARKETS: '/markets/all',
  MARKET: '/markets/:marketId',
  LIQUIDITY: '/liquidity/:marketId',
  PORTFOLIO: '/portfolio',
  DISCLAIMER: '/disclaimer',
  TRANSACT: '/transact',
  DEPOSIT: '/transact/deposit',
  WITHDRAW: '/transact/withdraw',
  TRANSFER: '/transact/transfer',
} as const;

type ConsoleLinks = {
  [R in keyof typeof Routes]: (...args: string[]) => string;
};

export const Links: ConsoleLinks = {
  HOME: () => Routes.HOME,
  MARKET: (marketId: string) =>
    trimEnd(Routes.MARKET.replace(':marketId', marketId)),
  MARKETS: () => Routes.MARKETS,
  PORTFOLIO: () => Routes.PORTFOLIO,
  LIQUIDITY: (marketId: string) =>
    trimEnd(Routes.LIQUIDITY.replace(':marketId', marketId)),
  DISCLAIMER: () => Routes.DISCLAIMER,
  TRANSACT: () => Routes.TRANSACT,
  DEPOSIT: () => Routes.DEPOSIT,
  WITHDRAW: () => Routes.WITHDRAW,
  TRANSFER: () => Routes.TRANSFER,
};

const NotFound = () => (
  <Splash>
    <p>{t('Page not found')}</p>
  </Splash>
);

export const routerConfig: RouteObject[] = [
  // Pages that dont use the sidebar must come first
  // to ensure they are matched before /*
  {
    path: 'transact/*',
    element: <Transact />,
    children: [
      { index: true, element: null },
      { path: 'deposit', element: <Deposit /> },
      { path: 'withdraw', element: <Withdraw /> },
      { path: 'transfer', element: <Transfer /> },
    ],
  },
  {
    path: 'disclaimer',
    element: <LayoutCentered />,
    children: [{ index: true, element: <Disclaimer /> }],
  },

  // All other pages will use the sidebar
  {
    path: '/*',
    element: <LayoutWithSidebar />,
    children: [
      {
        index: true,
        element: <Home />,
        // element: <Navigate to="all" />,
      },
      {
        path: 'markets',
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <Navigate to="all" />,
          },
          {
            path: 'all',
            element: <MarketsPage />,
          },
          {
            path: ':marketId',
            element: <MarketPage />,
          },
        ],
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
      {
        path: 'liquidity/:marketId',
        element: <Liquidity />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export const ClientRouter = () => {
  const routes = useRoutes(routerConfig);
  return (
    <Suspense
      fallback={
        <Splash>
          <Loader />
        </Splash>
      }
    >
      {routes}
    </Suspense>
  );
};
