import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { t } from '@vegaprotocol/i18n';
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

const LazySettings = dynamic(() => import('../client-pages/settings'), {
  ssr: false,
});

const LazyDisclaimer = dynamic(() => import('../client-pages/disclaimer'), {
  ssr: false,
});

export enum Routes {
  HOME = '/',
  MARKET = '/markets',
  MARKETS = '/markets/all',
  PORTFOLIO = '/portfolio',
  LIQUIDITY = 'liquidity/:marketId',
  SETTINGS = 'settings',
  DISCLAIMER = 'disclaimer',
}

type ConsoleLinks = { [r in Routes]: (...args: string[]) => string };
export const Links: ConsoleLinks = {
  [Routes.HOME]: () => Routes.HOME,
  [Routes.MARKET]: (marketId: string | null | undefined) =>
    marketId ? trimEnd(`${Routes.MARKET}/${marketId}`, '/') : Routes.MARKET,
  [Routes.MARKETS]: () => Routes.MARKETS,
  [Routes.PORTFOLIO]: () => Routes.PORTFOLIO,
  [Routes.LIQUIDITY]: (marketId: string | null | undefined) =>
    marketId
      ? trimEnd(`${Routes.LIQUIDITY}/${marketId}`, '/')
      : Routes.LIQUIDITY,
  [Routes.SETTINGS]: () => Routes.SETTINGS,
  [Routes.DISCLAIMER]: () => Routes.DISCLAIMER,
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
    children: [
      {
        index: true,
        element: <LazyLiquidity />,
      },
      {
        path: ':marketId',
        element: <LazyLiquidity />,
      },
    ],
  },
  {
    path: Routes.PORTFOLIO,
    element: <LazyPortfolio />,
  },
  {
    path: Routes.SETTINGS,
    element: <LazySettings />,
  },
  {
    path: Routes.DISCLAIMER,
    element: <LazyDisclaimer />,
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
