import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { LayoutCentered } from '../components/layouts';
import { LayoutWithSky } from '../components/layouts-inner';
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
import { Referrals } from '../client-pages/referrals/referrals';
import { ReferralStatistics } from '../client-pages/referrals/referral-statistics';
import { ApplyCodeFormContainer } from '../client-pages/referrals/apply-code-form';
import { CreateCodeContainer } from '../client-pages/referrals/create-code-form';
import { NotFound as ReferralNotFound } from '../client-pages/referrals/error-boundary';
import { compact } from 'lodash';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { useT } from '../lib/use-t';
import { CompetitionsHome } from '../client-pages/competitions/competitions-home';
import { CompetitionsTeams } from '../client-pages/competitions/competitions-teams';
import { CompetitionsTeam } from '../client-pages/competitions/competitions-team';
import { CompetitionsCreateTeam } from '../client-pages/competitions/competitions-create-team';
import { CompetitionsUpdateTeam } from '../client-pages/competitions/competitions-update-team';
import { CompetitionsGame } from '../client-pages/competitions/competitions-game';
import { Swap } from '../client-pages/swap/swap';

// These must remain dynamically imported as pennant cannot be compiled by Next.js due to ESM
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

export const useRouterConfig = (): RouteObject[] => {
  const featureFlags = useFeatureFlags((state) => state.flags);

  const routeConfig = compact([
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
    featureFlags.REFERRALS
      ? {
          path: AppRoutes.REFERRALS,
          element: <Outlet />,
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
                  element: <ApplyCodeFormContainer />,
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
    featureFlags.TEAM_COMPETITION
      ? {
          path: AppRoutes.COMPETITIONS,
          element: <Outlet />,
          children: [
            // pages with planets and stars
            {
              element: <LayoutWithSky />,
              children: [
                { index: true, element: <CompetitionsHome /> },
                {
                  path: AppRoutes.COMPETITIONS_TEAMS,
                  element: <CompetitionsTeams />,
                },
                {
                  path: AppRoutes.COMPETITIONS_GAME,
                  element: <CompetitionsGame />,
                },
              ],
            },
            // pages with blurred background
            {
              path: AppRoutes.COMPETITIONS_CREATE_TEAM,
              element: <CompetitionsCreateTeam />,
            },
            {
              path: AppRoutes.COMPETITIONS_UPDATE_TEAM,
              element: <CompetitionsUpdateTeam />,
            },
            {
              path: AppRoutes.COMPETITIONS_TEAM,
              element: <CompetitionsTeam />,
            },
          ],
        }
      : undefined,
    {
      path: 'fees/*',
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Fees />,
        },
      ],
    },
    {
      path: 'rewards/*',
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Rewards />,
        },
      ],
    },
    {
      path: 'markets/*',
      element: <Outlet />,
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
      element: <Outlet />,
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
            { path: 'swap', element: <Swap />, id: AppRoutes.SWAP },
          ],
        },
      ],
    },

    {
      path: 'liquidity/*',
      element: <Outlet />,
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

  return routeConfig;
};

export const ClientRouter = () => {
  const routes = useRoutes(useRouterConfig());
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
