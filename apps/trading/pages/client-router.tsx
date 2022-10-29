import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import dynamic from 'next/dynamic';

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

const LazyDeposit = dynamic(() => import('../client-pages/deposit'), {
  ssr: false,
});

export enum Routes {
  HOME = '/',
  MARKETS = '/markets',
  PORTFOLIO = '/portfolio',
  PORTFOLIO_DEPOSIT = '/portfolio/deposit',
}

const routerConfig = [
  {
    index: true,
    element: <LazyHome />,
  },
  {
    path: Routes.HOME,
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
    path: Routes.PORTFOLIO_DEPOSIT,
    element: <LazyDeposit />,
  },
];

export const ClientRouter = () => {
  const routes = useRoutes(routerConfig);
  return (
    <Suspense fallback={<div>Suspense fallback...</div>}>{routes}</Suspense>
  );
};
