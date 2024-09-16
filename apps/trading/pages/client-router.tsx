import {
  type RouteObject,
  Navigate,
  useRoutes,
  Outlet,
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
import { Rewards, RewardsDetail } from '../client-pages/rewards';
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
import { NotFound } from '../client-pages/not-found';

import { LayoutCentered, LayoutFull } from '../components/layouts';

import { Routes as AppRoutes } from '../lib/links';
import { Explore } from '../client-pages/amm/explore';
import { Pools } from '../client-pages/amm/pools';
import { MarketPage as Pool } from '../client-pages/amm/pools/market/index';
import { Liquidity as MyLiquidity } from '../client-pages/amm/liquidity';
import { ManageLiquidity } from '../client-pages/amm/pools/market/manage-liquidity';
import { AmmWrapper } from '../client-pages/amm/amm-wrapper';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { Invite } from '../client-pages/invite';

// These must remain dynamically imported as pennant cannot be compiled by Next.js due to ESM
// Using dynamic imports is a workaround for this until pennant is published as ESM
const MarketPage = lazy(() => import('../client-pages/market'));
const Portfolio = lazy(() => import('../client-pages/portfolio'));

export const useRouterConfig = (): RouteObject[] => {
  const { flags } = useFeatureFlags();
  const routeConfig = compact([
    {
      index: true,
      element: flags.ENABLE_HOMEPAGE ? (
        <LayoutCentered backdrop={1}>
          <Home />
        </LayoutCentered>
      ) : (
        <Navigate to={AppRoutes.MARKETS} />
      ),
    },
    {
      path: AppRoutes.DISCLAIMER,
      element: <LayoutCentered backdrop={2} />,
      children: [{ index: true, element: <Disclaimer /> }],
    },
    {
      path: AppRoutes.REFERRALS,
      element: <LayoutCentered backdrop={2} />,
      children: [
        {
          element: <Referrals />,
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
      element: <Outlet />,
      children: [
        {
          element: <LayoutCentered backdrop={1} />,
          children: [
            { index: true, element: <CompetitionsHome /> },
            {
              path: AppRoutes.COMPETITIONS_TEAMS,
              element: <CompetitionsTeams />,
            },
          ],
        },
        {
          element: <LayoutCentered backdrop={2} />,
          children: [
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
            {
              path: AppRoutes.COMPETITIONS_GAME,
              element: <CompetitionsGame />,
            },
          ],
        },
      ],
    },
    {
      path: AppRoutes.FEES,
      element: <LayoutCentered backdrop={2} />,
      children: [
        {
          index: true,
          element: <Fees />,
        },
      ],
    },
    {
      path: AppRoutes.REWARDS,
      element: <LayoutCentered backdrop={2} />,
      children: [
        {
          index: true,
          element: <Rewards />,
        },
      ],
    },
    {
      path: AppRoutes.REWARDS_DETAIL,
      element: <LayoutCentered backdrop={1} />,
      children: [
        {
          index: true,
          element: <RewardsDetail />,
        },
      ],
    },
    {
      path: AppRoutes.MARKETS,
      element: <LayoutFull backdrop={1} />,
      children: [
        {
          index: true,
          element: (
            <LayoutCentered>
              <MarketsPage />
            </LayoutCentered>
          ),
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
      element: <LayoutFull backdrop={1} />,
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
            { path: 'swap', element: <Swap /> },
          ],
        },
      ],
    },
    {
      path: 'liquidity',
      element: <LayoutFull backdrop={2} />,
      children: [
        {
          path: ':marketId',
          element: <Liquidity />,
        },
      ],
    },
    {
      path: AppRoutes.AMM,
      element: flags.ENABLE_AMM ? (
        <AmmWrapper>
          <LayoutCentered backdrop={3} />
        </AmmWrapper>
      ) : (
        <Navigate to={AppRoutes.HOME} />
      ),
      children: [
        {
          index: true,
          element: <Explore />,
        },
        {
          path: AppRoutes.AMM_POOLS,
          element: <Pools />,
        },
        {
          path: AppRoutes.AMM_POOL,
          element: <Pool />,
        },
        {
          path: AppRoutes.AMM_POOL_MANAGE,
          element: <ManageLiquidity />,
        },
        {
          path: AppRoutes.AMM_MY_LIQUIDITY,
          element: <MyLiquidity />,
        },
      ],
    },
    {
      path: `${AppRoutes.INVITE}`,
      element: <LayoutCentered />,
      children: [{ index: true, path: '*', element: <Invite /> }],
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
