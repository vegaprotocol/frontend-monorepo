import type { RouteObject } from 'react-router-dom';
import { Navigate, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
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
import { Fees } from '../client-pages/fees';
import { Rewards } from '../client-pages/rewards';
import { Routes as AppRoutes } from '../lib/links';
import { LayoutWithSky } from '../client-pages/referrals/layout';
import { Referrals } from '../client-pages/referrals/referrals';
import { ReferralStatistics } from '../client-pages/referrals/referral-statistics';
import { ApplyCodeForm } from '../client-pages/referrals/apply-code-form';
import { CreateCodeContainer } from '../client-pages/referrals/create-code-form';
import { NotFound as ReferralNotFound } from '../client-pages/referrals/error-boundary';
import { compact } from 'lodash';
import { FLAGS } from '@vegaprotocol/environment';
import { LiquidityHeader } from '../components/liquidity-header';
import { MarketHeader } from '../components/market-header';
import { PortfolioSidebar } from '../client-pages/portfolio/portfolio-sidebar';
import { LiquiditySidebar } from '../client-pages/liquidity/liquidity-sidebar';
import { MarketsSidebar } from '../client-pages/markets/markets-sidebar';
import { useT } from '../lib/use-t';

// These must remain dynamically imported as pennant cannot be compiled by nextjs due to ESM
// Using dynamic imports is a workaround for this until pennant is published as ESM
const MarketPage = lazy(() => import('../client-pages/market'));
const Portfolio = lazy(() => import('../client-pages/portfolio'));

const NotFound = () => {
  const t = useT();
  return (
    <Splash>
      <p>{t('Page not found')}</p>
    </Splash>
  );
};

export const routerConfig: RouteObject[] = compact([
  {
    index: true,
    element: <Home />,
    id: AppRoutes.HOME,
  },
  {
    path: 'disclaimer',
    element: <LayoutCentered />,
    id: AppRoutes.DISCLAIMER,
    children: [{ index: true, element: <Disclaimer /> }],
  },
  // Referrals routing (the pages should be available if the feature flag is on)
  FLAGS.REFERRALS
    ? {
        path: AppRoutes.REFERRALS,
        element: <LayoutWithSidebar sidebar={<PortfolioSidebar />} />,
        children: [
          {
            element: (
              <LayoutWithSky>
                <Referrals />
              </LayoutWithSky>
            ),
            children: [
              {
                index: true,
                element: <ReferralStatistics />,
              },
              {
                path: AppRoutes.REFERRALS_CREATE_CODE,
                element: <CreateCodeContainer />,
              },
              {
                path: AppRoutes.REFERRALS_APPLY_CODE,
                element: <ApplyCodeForm />,
              },
            ],
          },
          {
            path: '*',
            element: <ReferralNotFound />,
          },
        ],
      }
    : undefined,
  {
    path: 'fees/*',
    element: <LayoutWithSidebar sidebar={<PortfolioSidebar />} />,
    children: [
      {
        index: true,
        element: <Fees />,
      },
    ],
  },
  {
    path: 'rewards/*',
    element: <LayoutWithSidebar sidebar={<PortfolioSidebar />} />,
    children: [
      {
        index: true,
        element: <Rewards />,
      },
    ],
  },
  {
    path: 'markets/*',
    element: (
      <LayoutWithSidebar
        header={<MarketHeader />}
        sidebar={<MarketsSidebar />}
      />
    ),
    children: [
      {
        index: true,
        element: <MarketsPage />,
        id: AppRoutes.MARKETS,
      },
      {
        path: 'all',
        element: <Navigate to="/markets" />,
      },
      {
        path: ':marketId',
        element: <MarketPage />,
        id: AppRoutes.MARKET,
      },
    ],
  },
  {
    path: 'portfolio/*',
    element: <LayoutWithSidebar sidebar={<PortfolioSidebar />} />,
    children: [
      {
        index: true,
        element: <Portfolio />,
        id: AppRoutes.PORTFOLIO,
      },
      {
        path: 'assets',
        element: <Assets />,
        id: AppRoutes.ASSETS,
        children: [
          { index: true, element: <Navigate to="deposit" /> },
          { path: 'deposit', element: <Deposit />, id: AppRoutes.DEPOSIT },
          { path: 'withdraw', element: <Withdraw />, id: AppRoutes.WITHDRAW },
          { path: 'transfer', element: <Transfer />, id: AppRoutes.TRANSFER },
        ],
      },
    ],
  },

  {
    path: 'liquidity/*',
    element: (
      <LayoutWithSidebar
        header={<LiquidityHeader />}
        sidebar={<LiquiditySidebar />}
      />
    ),
    id: AppRoutes.LIQUIDITY,
    children: [
      {
        path: ':marketId',
        element: <Liquidity />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

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
