import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { LayoutWithSidebar } from '../components/layouts';
import { LayoutCentered } from '../components/layouts/layout-centered';
import { Home } from '../client-pages/home';
import { Liquidity } from '../client-pages/liquidity';
import { MarketsPage } from '../client-pages/markets';
import { Disclaimer } from '../client-pages/disclaimer';
import { Assets } from '../client-pages/assets';
import { Deposit } from '../client-pages/deposit';
import { Withdraw } from '../client-pages/withdraw';
import { Transfer } from '../client-pages/transfer';

// These must remain dynamically imported as pennant cannot be compiled by nextjs due to ESM
// Using dynamic imports is a workaround for this until pennant is published as ESM
const MarketPage = lazy(() => import('../client-pages/market'));
const Portfolio = lazy(() => import('../client-pages/portfolio'));

const NotFound = () => (
  <Splash>
    <p>{t('Page not found')}</p>
  </Splash>
);

export const routerConfig: RouteObject[] = [
  // Pages that dont use the LayoutWithSidebar must come first
  // to ensure they are matched before the catch all route '/*'
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
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <Portfolio />,
          },
          {
            path: 'assets',
            element: <Assets />,
            children: [
              { index: true, element: <Navigate to="deposit" /> },
              { path: 'deposit', element: <Deposit /> },
              { path: 'withdraw', element: <Withdraw /> },
              { path: 'transfer', element: <Transfer /> },
            ],
          },
        ],
      },
      {
        path: 'liquidity/:marketId',
        element: <Liquidity />,
      },

      // NotFound page is here so its caught within parent '/*' route
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
