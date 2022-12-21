import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';

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
  SKELETON_MARKET = '/markets',
  MARKET = '/markets/:marketId',
  MARKETS = '/markets/all',
  PORTFOLIO = '/portfolio',
  LIQUIDITY = 'liquidity/:marketId',
}

export const Links = {
  HOME: () => Routes.HOME,
  SKELETON_MARKET: () => Routes.SKELETON_MARKET,
  MARKET: (marketId: string) => Routes.MARKET.replace(':marketId', marketId),
  MARKETS: () => Routes.MARKETS,
  PORTFOLIO: () => Routes.PORTFOLIO,
  LIQUIDITY: (marketId: string) =>
    Routes.LIQUIDITY.replace(':marketId', marketId),
};

const routerConfig = [
  {
    index: true,
    element: <LazyHome />,
  },
  {
    path: Routes.MARKETS,
    element: <LazyMarkets />,
  },
  {
    path: Routes.SKELETON_MARKET,
    element: <LazyMarket skeleton={true} />,
  },
  {
    path: Routes.MARKET,
    element: <LazyMarket />,
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
          {t('Loading...')}
        </div>
      }
    >
      {routes}
    </Suspense>
  );
};
