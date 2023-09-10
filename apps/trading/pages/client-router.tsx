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

export enum Routes {
  HOME = '/',
  MARKET = '/markets/:marketId',
  MARKETS = '/markets/all',
  PORTFOLIO = '/portfolio',
  LIQUIDITY = '/liquidity/:marketId',
  DISCLAIMER = '/disclaimer',
  TRANSACT = '/transact',
  DEPOSIT = '/transact/deposit',
  WITHDRAW = '/transact/withdraw',
  TRANSFER = '/transact/transfer',
}

type ConsoleLinks = { [r in Routes]: (...args: string[]) => string };

export const Links: ConsoleLinks = {
  [Routes.HOME]: () => Routes.HOME,
  [Routes.MARKET]: (marketId: string) =>
    trimEnd(Routes.MARKET.replace(':marketId', marketId)),
  [Routes.MARKETS]: () => Routes.MARKETS,
  [Routes.PORTFOLIO]: () => Routes.PORTFOLIO,
  [Routes.LIQUIDITY]: (marketId: string) =>
    trimEnd(Routes.LIQUIDITY.replace(':marketId', marketId)),
  [Routes.DISCLAIMER]: () => Routes.DISCLAIMER,
  [Routes.TRANSACT]: () => Routes.TRANSACT,
  [Routes.DEPOSIT]: () => Routes.DEPOSIT,
  [Routes.WITHDRAW]: () => Routes.WITHDRAW,
  [Routes.TRANSFER]: () => Routes.TRANSFER,
};

const NotFound = () => (
  <Splash>
    <p>{t('Page not found')}</p>
  </Splash>
);

const routerConfig: RouteObject[] = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: 'markets/*',
    element: <LayoutWithSidebar />,
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
        element: <Outlet />,
        children: [
          { index: true, element: <MarketPage /> },
          { path: 'liquidity', element: <Liquidity /> },
        ],
      },
    ],
  },
  {
    path: 'portfolio',
    element: <LayoutWithSidebar />,
    children: [{ index: true, element: <Portfolio /> }],
  },
  {
    path: Routes.TRANSACT,
    element: <Transact />,
    children: [
      { index: true, element: null },
      { path: 'deposit', element: <Deposit /> },
      { path: 'withdraw', element: <Withdraw /> },
      { path: 'transfer', element: <Transfer /> },
    ],
  },
  {
    path: Routes.DISCLAIMER,
    element: <LayoutCentered />,
    children: [{ index: true, element: <Disclaimer /> }],
  },
  {
    path: '*',
    element: <NotFound />,
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
