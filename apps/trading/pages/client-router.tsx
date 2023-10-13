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
import { Routes } from '../lib/links';
import { LayoutWithSky } from '../client-pages/referrals/layout';
import { Referrals } from '../client-pages/referrals/referrals';
import { ReferralStatistics } from '../client-pages/referrals/referral-statistics';
import { ApplyCodeForm } from '../client-pages/referrals/apply-code-form';
import { CreateCodeContainer } from '../client-pages/referrals/create-code-form';
import { NotFound as ReferralNotFound } from '../client-pages/referrals/error-boundary';
import { compact } from 'lodash';
import { FLAGS } from '@vegaprotocol/environment';

// These must remain dynamically imported as pennant cannot be compiled by nextjs due to ESM
// Using dynamic imports is a workaround for this until pennant is published as ESM
const MarketPage = lazy(() => import('../client-pages/market'));
const Portfolio = lazy(() => import('../client-pages/portfolio'));

const NotFound = () => (
  <Splash>
    <p>{t('Page not found')}</p>
  </Splash>
);

export const routerConfig: RouteObject[] = compact([
  // Pages that don't use the LayoutWithSidebar must come first
  // to ensure they are matched before the catch all route '/*'
  {
    path: 'disclaimer',
    element: <LayoutCentered />,
    id: Routes.DISCLAIMER,
    children: [{ index: true, element: <Disclaimer /> }],
  },
  // Referrals routing (the pages should be available if the feature flag is on)
  FLAGS.REFERRALS
    ? {
        path: Routes.REFERRALS,
        element: <LayoutWithSky />,
        children: [
          {
            element: <Referrals />,
            children: [
              {
                index: true,
                element: <ReferralStatistics />,
              },
              {
                path: Routes.REFERRALS_CREATE_CODE,
                element: <CreateCodeContainer />,
              },
              {
                path: Routes.REFERRALS_APPLY_CODE,
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
  // All other pages will use the sidebar
  {
    path: '/*',
    element: <LayoutWithSidebar />,
    children: [
      {
        index: true,
        element: <Home />,
        id: Routes.HOME,
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
            id: Routes.MARKETS,
          },
          {
            path: ':marketId',
            element: <MarketPage />,
            id: Routes.MARKET,
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
            id: Routes.PORTFOLIO,
          },
          {
            path: 'assets',
            element: <Assets />,
            id: Routes.ASSETS,
            children: [
              { index: true, element: <Navigate to="deposit" /> },
              { path: 'deposit', element: <Deposit />, id: Routes.DEPOSIT },
              { path: 'withdraw', element: <Withdraw />, id: Routes.WITHDRAW },
              { path: 'transfer', element: <Transfer />, id: Routes.TRANSFER },
            ],
          },
        ],
      },
      {
        path: 'liquidity/:marketId',
        element: <Liquidity />,
        id: Routes.LIQUIDITY,
      },
      // NotFound page is here so its caught within parent '/*' route
      {
        path: '*',
        element: <NotFound />,
      },
    ],
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
