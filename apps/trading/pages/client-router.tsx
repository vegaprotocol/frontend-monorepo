import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Outlet, useRoutes } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { t } from '@vegaprotocol/i18n';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import trimEnd from 'lodash/trimEnd';
import { LayoutWithSidebar } from '../components/layouts';
import { LayoutWithSky } from '../client-pages/referrals/layout';
import { ReferralStatistics } from '../client-pages/referrals/referral-statistics';
import { ApplyCodeForm } from '../client-pages/referrals/apply-code-form';
import { CreateCodeForm } from '../client-pages/referrals/create-code-form';

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

const LazyDisclaimer = dynamic(() => import('../client-pages/disclaimer'), {
  ssr: false,
});

const LazyDeposit = dynamic(() => import('../client-pages/deposit'), {
  ssr: false,
});

const LazyReferrals = dynamic(
  () => import('../client-pages/referrals/referrals'),
  {
    ssr: false,
  }
);

export enum Routes {
  HOME = '/',
  MARKET = '/markets/:marketId',
  MARKETS = '/markets/all',
  PORTFOLIO = '/portfolio',
  LIQUIDITY = '/liquidity/:marketId',
  DISCLAIMER = '/disclaimer',
  DEPOSIT = '/deposit',
  REFERRALS = '/referrals',
  REFERRALS_APPLY_CODE = '/referrals/apply-code',
  REFERRALS_CREATE_CODE = '/referrals/create-code',
  TEAMS = '/teams',
}

type ConsoleLinks = { [r in Routes]: (...args: string[]) => string };

export const Links: ConsoleLinks = {
  [Routes.HOME]: () => Routes.HOME,
  [Routes.MARKET]: (marketId: string) =>
    trimEnd(Routes.MARKET.replace(':marketId', marketId)),
  [Routes.MARKETS]: () => Routes.MARKETS,
  [Routes.PORTFOLIO]: () => Routes.PORTFOLIO,
  [Routes.LIQUIDITY]: (marketId: string) =>
    trimEnd(Routes.LIQUIDITY.replace(':marketId', marketId)),
  [Routes.DISCLAIMER]: () => Routes.DISCLAIMER,
  [Routes.DEPOSIT]: () => Routes.DEPOSIT,
  [Routes.REFERRALS]: () => Routes.REFERRALS,
  [Routes.REFERRALS_APPLY_CODE]: () => Routes.REFERRALS_APPLY_CODE,
  [Routes.REFERRALS_CREATE_CODE]: () => Routes.REFERRALS_CREATE_CODE,
  [Routes.TEAMS]: () => Routes.TEAMS,
};

export const routerConfig: RouteObject[] = [
  {
    path: '/*',
    element: <LayoutWithSidebar />,
    children: [
      // all pages that require the Layout component (Sidebar)
      {
        index: true,
        element: <LazyHome />,
        id: Routes.HOME,
      },
      {
        path: 'markets',
        element: <Outlet />,
        children: [
          {
            path: 'all',
            element: <LazyMarkets />,
            id: Routes.MARKETS,
          },
          {
            path: ':marketId',
            element: <LazyMarket />,
            id: Routes.MARKET,
          },
        ],
      },
      {
        path: 'portfolio',
        element: <LazyPortfolio />,
        id: Routes.PORTFOLIO,
      },
      {
        path: 'liquidity',
        element: <Outlet />,
        children: [
          {
            path: ':marketId',
            element: <LazyLiquidity />,
            id: Routes.LIQUIDITY,
          },
        ],
      },
    ],
  },
  {
    path: Routes.DISCLAIMER,
    element: <LazyDisclaimer />,
  },
  { path: Routes.DEPOSIT, element: <LazyDeposit /> },
  // Referrals routing:
  {
    path: Routes.REFERRALS,
    element: <LayoutWithSky />,
    children: [
      {
        element: <LazyReferrals />,
        children: [
          {
            index: true,
            element: <ReferralStatistics />,
          },
          {
            path: Routes.REFERRALS_APPLY_CODE,
            element: <ApplyCodeForm />,
          },
          {
            path: Routes.REFERRALS_CREATE_CODE,
            element: <CreateCodeForm />,
          },
        ],
      },
    ],
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
