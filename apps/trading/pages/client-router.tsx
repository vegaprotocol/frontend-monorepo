import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { t } from '@vegaprotocol/react-helpers';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import trimEnd from 'lodash/trimEnd';

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

export enum Routes {
  HOME = '/',
  MARKET = '/markets',
  MARKETS = '/markets/all',
  PORTFOLIO = '/portfolio',
  LIQUIDITY = 'liquidity/:marketId',
}

type ConsoleLinks = { [r in Routes]: (...args: string[]) => string };
export const Links: ConsoleLinks = {
  [Routes.HOME]: () => Routes.HOME,
  [Routes.MARKET]: (marketId: string | null | undefined) =>
    marketId ? trimEnd(`${Routes.MARKET}/${marketId}`, '/') : Routes.MARKET,
  [Routes.MARKETS]: () => Routes.MARKETS,
  [Routes.PORTFOLIO]: () => Routes.PORTFOLIO,
  [Routes.LIQUIDITY]: (marketId: string) =>
    Routes.LIQUIDITY.replace(':marketId', marketId),
};

const routerConfig: RouteObject[] = [
  {
    index: true,
    element: <LazyHome />,
  },
  {
    path: Routes.MARKETS,
    element: <LazyMarkets />,
  },
  {
    path: Routes.MARKET,
    children: [
      {
        index: true,
        element: <LazyMarket />,
      },
      {
        path: ':marketId',
        element: <LazyMarket />,
      },
    ],
  },
  {
    path: Routes.LIQUIDITY,
    element: <LazyLiquidity />,
  },
  {
    path: Routes.PORTFOLIO,
    element: <LazyPortfolio />,
  },
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
        <div className="w-full h-full flex justify-center items-center">
          <Loader />
        </div>
      }
    >
      {routes}
    </Suspense>
  );
};
