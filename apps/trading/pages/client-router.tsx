import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Outlet, useRoutes } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { t } from '@vegaprotocol/i18n';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import trimEnd from 'lodash/trimEnd';
import { LayoutWithSidebar } from '../components/layouts';
import { Deposit } from '../client-pages/deposit';
import { Withdraw } from '../client-pages/withdraw';
import { Transfer } from '../client-pages/transfer';

const LazyHome = dynamic(() => import('../client-pages/home'), {
  ssr: false,
});

const LazyLiquidity = dynamic(() => import('../client-pages/liquidity'), {
  ssr: false,
});

const LazyMarkets = dynamic(() => import('../client-pages/markets'), {
  ssr: false,
});

const LazyMarket = dynamic(() => import('../client-pages/market'), {
  ssr: false,
});

const LazyPortfolio = dynamic(() => import('../client-pages/portfolio'), {
  ssr: false,
});

const LazyDisclaimer = dynamic(() => import('../client-pages/disclaimer'), {
  ssr: false,
});

export enum Routes {
  HOME = '/',
  MARKET = '/markets/:marketId',
  MARKETS = '/markets/all',
  PORTFOLIO = '/portfolio',
  LIQUIDITY = '/liquidity/:marketId',
  DISCLAIMER = '/disclaimer',
  DEPOSIT = '/deposit',
  WITHDRAW = '/withdraw',
  TRANSFER = '/transfer',
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
  [Routes.DEPOSIT]: () => Routes.DEPOSIT,
  [Routes.WITHDRAW]: () => Routes.WITHDRAW,
  [Routes.TRANSFER]: () => Routes.TRANSFER,
};

export const routerConfig: RouteObject[] = [
  {
    path: '/*',
    element: <LayoutWithSidebar />,
    children: [
      // all pages that require the Layout component (Sidebar)
      {
        index: true,
        element: <LazyHome />,
        id: Routes.HOME,
      },
      {
        path: 'markets',
        element: <Outlet />,
        children: [
          {
            path: 'all',
            element: <LazyMarkets />,
            id: Routes.MARKETS,
          },
          {
            path: ':marketId',
            element: <LazyMarket />,
            id: Routes.MARKET,
          },
        ],
      },
      {
        path: 'portfolio',
        element: <LazyPortfolio />,
        id: Routes.PORTFOLIO,
      },
      {
        path: 'liquidity',
        element: <Outlet />,
        children: [
          {
            path: ':marketId',
            element: <LazyLiquidity />,
            id: Routes.LIQUIDITY,
          },
        ],
      },
    ],
  },
  {
    path: Routes.DISCLAIMER,
    element: <LazyDisclaimer />,
  },
  { path: Routes.DEPOSIT, element: <Deposit /> },
  { path: Routes.WITHDRAW, element: <Withdraw /> },
  { path: Routes.TRANSFER, element: <Transfer /> },
  {
    path: '*',
    element: (
      <Splash>
        <p>{t('Not found')}</p>
      </Splash>
    ),
  },
];

export const ClientRouter = () => {
  const routes = useRoutes(routerConfig);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-full">
          <Loader />
        </div>
      }
    >
      {routes}
    </Suspense>
  );
};
