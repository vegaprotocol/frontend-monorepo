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
  MARKETS = '/markets',
  PORTFOLIO = '/portfolio',
}

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
    path: 'markets/:marketId',
    element: <LazyMarket />,
  },
  {
    path: 'liquidity/:marketId',
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
