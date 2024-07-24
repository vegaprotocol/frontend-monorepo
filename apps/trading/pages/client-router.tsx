import {
  type RouteObject,
  Navigate,
  Outlet,
  useRoutes,
} from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { compact } from 'lodash';

import { Loader, Splash } from '@vegaprotocol/ui-toolkit';

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
import { Referrals } from '../client-pages/referrals/referrals';
import { ReferralStatistics } from '../client-pages/referrals/referral-statistics';
import { ApplyCodeFormContainer } from '../client-pages/referrals/apply-code-form';
import { CreateCodeContainer } from '../client-pages/referrals/create-code-form';
import { CompetitionsHome } from '../client-pages/competitions/competitions-home';
import { CompetitionsTeams } from '../client-pages/competitions/competitions-teams';
import { CompetitionsTeam } from '../client-pages/competitions/competitions-team';
import { CompetitionsCreateTeam } from '../client-pages/competitions/competitions-create-team';
import { CompetitionsUpdateTeam } from '../client-pages/competitions/competitions-update-team';
import { CompetitionsGame } from '../client-pages/competitions/competitions-game';
import { Swap } from '../client-pages/swap/swap';
import { DepositCrossChain } from '../client-pages/deposit-cross-chain';
import { NotFound } from '../client-pages/not-found';

import { LayoutCentered, LayoutWithNodeHealth } from '../components/layouts';
import { LayoutWithSky } from '../components/layouts-inner';

import { Routes as AppRoutes } from '../lib/links';

// These must remain dynamically imported as pennant cannot be compiled by Next.js due to ESM
// Using dynamic imports is a workaround for this until pennant is published as ESM
const MarketPage = lazy(() => import('../client-pages/market'));
const Portfolio = lazy(() => import('../client-pages/portfolio'));

export const useRouterConfig = (): RouteObject[] => {
  const routeConfig = compact([
    {
      index: true,
      element: <Home />,
    },
    {
      path: AppRoutes.DISCLAIMER,
      element: <LayoutCentered />,
      children: [{ index: true, element: <Disclaimer /> }],
    },
    {
      path: AppRoutes.REFERRALS,
      element: <LayoutWithNodeHealth />,
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
      ],
    },
    {
      path: AppRoutes.COMPETITIONS,
      element: <LayoutWithNodeHealth />,
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
    },
    {
      path: AppRoutes.FEES,
      element: <LayoutWithNodeHealth />,
      children: [
        {
          index: true,
          element: <Fees />,
        },
      ],
    },
    {
      path: AppRoutes.REWARDS,
      element: <LayoutWithNodeHealth />,
      children: [
        {
          index: true,
          element: <Rewards />,
        },
      ],
    },
    {
      path: AppRoutes.MARKETS,
      element: <Outlet />,
      children: [
        {
          element: <LayoutWithNodeHealth />,
          children: [{ index: true, element: <MarketsPage /> }],
        },
        {
          path: 'all',
          element: <Navigate to={AppRoutes.MARKETS} />,
        },
        {
          path: ':marketId',
          element: <MarketPage />,
        },
      ],
    },
    {
      path: AppRoutes.PORTFOLIO,
      element: <LayoutWithNodeHealth />,
      children: [
        {
          index: true,
          element: <Portfolio />,
        },
        {
          path: 'assets',
          element: <Assets />,
          children: [
            { index: true, element: <Navigate to="deposit" /> },
            { path: 'deposit', element: <Deposit /> },
            { path: 'withdraw', element: <Withdraw /> },
            { path: 'transfer', element: <Transfer /> },
            {
              path: 'deposit-cross-chain',
              element: <DepositCrossChain />,
            },
            { path: 'swap', element: <Swap /> },
          ],
        },
      ],
    },
    {
      path: 'liquidity',
      element: <Outlet />,
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
