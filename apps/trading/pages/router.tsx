import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const LazyHome = dynamic(() => import('../client-pages/home/home'), {
  ssr: false,
});

const LazyLiquidity = dynamic(() => import('../client-pages/liquidity'), {
  ssr: false,
});

const LazyMarkets = dynamic(() => import('../client-pages/markets'), {
  ssr: false,
});

const LazyMarket = dynamic(() => import('../client-pages/market/market'), {
  ssr: false,
});

const LazyPortfolio = dynamic(
  () => import('../client-pages/portfolio/portfolio'),
  {
    ssr: false,
  }
);

const LazyDeposit = dynamic(() => import('../client-pages/deposit/deposit'), {
  ssr: false,
});

export const Router = () => {
  return (
    <Suspense fallback={<div>Suspense fallback...</div>}>
      <Routes>
        <Route index={true} element={<LazyHome />} />
        <Route path="markets" element={<LazyMarkets />} />
        <Route path="markets/:marketId" element={<LazyMarket />} />
        <Route path="liquidity/:marketId" element={<LazyLiquidity />} />
        <Route path="portfolio" element={<LazyPortfolio />} />
        <Route path="portfolio/deposit" element={<LazyDeposit />} />
      </Routes>
    </Suspense>
  );
};
