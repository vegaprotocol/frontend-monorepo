import { AssetPage, AssetsPage } from './assets';
import BlockPage from './blocks';
import { Proposals } from './governance';
import Home from './home';
import OraclePage from './oracles';
import Oracles from './oracles/home';
import { Oracle } from './oracles/id';
import { Parties } from './parties/home';
import { Party } from './parties/id';
import { ValidatorsPage } from './validators';
import Genesis from './genesis';
import { Block } from './blocks/id';
import { Blocks } from './blocks/home';
import { Tx } from './txs/id';
import { TxsList } from './txs/home';
import { t } from '@vegaprotocol/i18n';
import { Routes } from './route-names';
import { NetworkParameters } from './network-parameters';
import { Outlet } from 'react-router-dom';
import type { Params, RouteObject } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MarketPage, MarketsPage } from './markets';
import type { ReactNode } from 'react';
import { ErrorBoundary, Layout } from './layout';
import compact from 'lodash/compact';
import { AssetLink, MarketLink } from '../components/links';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { remove0x } from '@vegaprotocol/utils';
import { PartyAccountsByAsset } from './parties/id/accounts';
import { PartyDepositsWithdrawals } from './parties/id/deposits-withdrawals';
import { Disclaimer } from './pages/disclaimer';
import { useFeatureFlags } from '@vegaprotocol/environment';
import RestrictedPage from './restricted';
import { NetworkTreasury } from './treasury';
import { MarketOraclesPage } from './markets/market-oracles-page';

export type Navigable = {
  path: string;
  handle: {
    name: string;
    text: string;
  };
};
export const isNavigable = (item: RouteObject): item is Navigable =>
  (item as Navigable).path !== undefined &&
  (item as Navigable).handle !== undefined &&
  (item as Navigable).handle.name !== undefined &&
  (item as Navigable).handle.text !== undefined;

export type Breadcrumbable = {
  handle: { breadcrumb: (data?: Params<string>) => ReactNode | string };
};
export const isBreadcrumbable = (item: RouteObject): item is Breadcrumbable =>
  (item as Breadcrumbable).handle !== undefined &&
  (item as Breadcrumbable).handle.breadcrumb !== undefined;

type RouteItem =
  | RouteObject
  | (RouteObject & Navigable)
  | (RouteObject & Breadcrumbable);
type Route = RouteItem & {
  children?: RouteItem[];
};

export const useRouterConfig = () => {
  const featureFlags = useFeatureFlags((state) => state.flags);

  const partiesRoutes: Route[] = featureFlags.EXPLORER_PARTIES
    ? [
        {
          path: Routes.PARTIES,
          element: <Outlet />,
          handle: {
            name: t('Parties'),
            text: t('Parties'),
            breadcrumb: () => <Link to={Routes.PARTIES}>{t('Parties')}</Link>,
          },
          children: [
            {
              index: true,
              element: <Parties />,
            },
            {
              path: ':party',
              element: <Outlet />,

              children: [
                {
                  index: true,
                  element: <Party />,
                  handle: {
                    breadcrumb: (params: Params<string>) => (
                      <Link to={linkTo(Routes.PARTIES, params.party)}>
                        {truncateMiddle(params.party as string)}
                      </Link>
                    ),
                  },
                },
                {
                  path: 'assets',
                  element: <Outlet />,
                  handle: {
                    breadcrumb: (params: Params<string>) => (
                      <Link to={linkTo(Routes.PARTIES, params.party)}>
                        {truncateMiddle(params.party as string)}
                      </Link>
                    ),
                  },
                  children: [
                    {
                      index: true,
                      element: <PartyAccountsByAsset />,
                      handle: {
                        breadcrumb: () => {
                          return t('Assets');
                        },
                      },
                    },
                  ],
                },
                {
                  path: 'deposits-withdrawals',
                  element: <Outlet />,
                  handle: {
                    breadcrumb: (params: Params<string>) => (
                      <Link to={linkTo(Routes.PARTIES, params.party)}>
                        {truncateMiddle(params.party as string)}
                      </Link>
                    ),
                  },
                  children: [
                    {
                      index: true,
                      element: <PartyDepositsWithdrawals />,
                      handle: {
                        breadcrumb: () => {
                          return t('Deposits & Withdrawals');
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
    : [];

  const assetsRoutes: Route[] = featureFlags.EXPLORER_ASSETS
    ? [
        {
          path: Routes.ASSETS,
          handle: {
            name: t('Assets'),
            text: t('Assets'),
            breadcrumb: () => <Link to={Routes.ASSETS}>{t('Assets')}</Link>,
          },
          children: [
            {
              index: true,
              element: <AssetsPage />,
            },
            {
              path: ':assetId',
              element: <AssetPage />,
              handle: {
                breadcrumb: (params: Params<string>) => (
                  <AssetLink assetId={params.assetId as string} />
                ),
              },
            },
          ],
        },
      ]
    : [];

  const genesisRoutes: Route[] = featureFlags.EXPLORER_GENESIS
    ? [
        {
          path: Routes.GENESIS,
          handle: {
            name: t('Genesis'),
            text: t('Genesis Parameters'),
            breadcrumb: () => (
              <Link to={Routes.GENESIS}>{t('Genesis Parameters')}</Link>
            ),
          },
          element: <Genesis />,
        },
      ]
    : [];

  const governanceRoutes: Route[] = featureFlags.EXPLORER_GOVERNANCE
    ? [
        {
          path: Routes.GOVERNANCE,
          handle: {
            name: t('Governance proposals'),
            text: t('Governance Proposals'),
            breadcrumb: () => (
              <Link to={Routes.GOVERNANCE}>{t('Governance Proposals')}</Link>
            ),
          },
          element: <Proposals />,
        },
      ]
    : [];

  const marketsRoutes: Route[] = featureFlags.EXPLORER_MARKETS
    ? [
        {
          path: Routes.MARKETS,
          handle: {
            name: t('Markets'),
            text: t('Markets'),
            breadcrumb: () => <Link to={Routes.MARKETS}>{t('Markets')}</Link>,
          },
          children: [
            {
              index: true,
              element: <MarketsPage />,
            },
            {
              path: ':marketId',
              element: <Outlet />,
              children: [
                {
                  index: true,
                  element: <MarketPage />,
                  handle: {
                    breadcrumb: (params: Params<string>) => (
                      <MarketLink id={params.marketId as string} />
                    ),
                  },
                },
                {
                  path: 'oracles',
                  element: <Outlet />,
                  handle: {
                    breadcrumb: (params: Params<string>) => (
                      <MarketLink id={params.marketId as string} />
                    ),
                  },
                  children: [
                    {
                      index: true,
                      element: <MarketOraclesPage />,
                      handle: {
                        breadcrumb: (params: Params<string>) => t('Oracles'),
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
    : [];

  const networkParametersRoutes: Route[] =
    featureFlags.EXPLORER_NETWORK_PARAMETERS
      ? [
          {
            path: Routes.NETWORK_PARAMETERS,
            handle: {
              name: t('NetworkParameters'),
              text: t('Network Parameters'),
              breadcrumb: () => (
                <Link to={Routes.NETWORK_PARAMETERS}>
                  {t('Network Parameters')}
                </Link>
              ),
            },
            element: <NetworkParameters />,
          },
        ]
      : [];

  const treasuryRoutes: Route[] = [
    {
      path: Routes.TREASURY,
      handle: {
        name: t('Treasury'),
        text: t('Treasury'),
        breadcrumb: () => <Link to={Routes.TREASURY}>{t('Treasury')}</Link>,
      },
      element: <NetworkTreasury />,
    },
  ];
  const validators: Route[] = featureFlags.EXPLORER_VALIDATORS
    ? [
        {
          path: Routes.VALIDATORS,
          handle: {
            name: t('Validators'),
            text: t('Validators'),
            breadcrumb: () => (
              <Link to={Routes.VALIDATORS}>{t('Validators')}</Link>
            ),
          },
          element: <ValidatorsPage />,
        },
      ]
    : [];

  const linkTo = (...segments: (string | undefined)[]) =>
    compact(segments).join('/');

  const routerConfig: Route[] = [
    {
      path: Routes.HOME,
      element: <Layout />,
      handle: {
        name: t('Home'),
        text: t('Home'),
        breadcrumb: () => <Link to={Routes.HOME}>{t('Home')}</Link>,
      },
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: Routes.TX,
          handle: {
            name: t('Txs'),
            text: t('Transactions'),
            breadcrumb: () => <Link to={Routes.TX}>{t('Transactions')}</Link>,
          },
          children: [
            {
              path: ':txHash',
              element: <Tx />,
              handle: {
                breadcrumb: (params: Params<string>) => (
                  <Link to={linkTo(Routes.TX, params.txHash)}>
                    {truncateMiddle(remove0x(params.txHash as string))}
                  </Link>
                ),
              },
            },
            {
              index: true,
              element: <TxsList />,
            },
          ],
        },
        {
          path: Routes.BLOCKS,
          handle: {
            name: t('Blocks'),
            text: t('Blocks'),
            breadcrumb: () => <Link to={Routes.BLOCKS}>{t('Blocks')}</Link>,
          },
          element: <BlockPage />,
          children: [
            {
              index: true,
              element: <Blocks />,
            },
            {
              path: ':block',
              element: <Block />,
              handle: {
                breadcrumb: (params: Params<string>) => (
                  <Link to={linkTo(Routes.BLOCKS, params.block)}>
                    {params.block}
                  </Link>
                ),
              },
            },
          ],
        },
        {
          path: Routes.ORACLES,
          handle: {
            name: t('Oracles'),
            text: t('Oracles'),
            breadcrumb: () => <Link to={Routes.ORACLES}>{t('Oracles')}</Link>,
          },
          element: <OraclePage />,
          children: [
            {
              index: true,
              element: <Oracles />,
            },
            {
              path: ':id',
              element: <Oracle />,
              handle: {
                breadcrumb: (params: Params<string>) => (
                  <Link to={linkTo(Routes.ORACLES, params.id)}>
                    {truncateMiddle(params.id as string)}
                  </Link>
                ),
              },
            },
          ],
        },
        {
          path: Routes.DISCLAIMER,
          element: <Disclaimer />,
          handle: {
            name: t('Disclaimer'),
            text: t('Disclaimer'),
            breadcrumb: () => (
              <Link to={Routes.DISCLAIMER}>{t('Disclaimer')}</Link>
            ),
          },
        },
        ...partiesRoutes,
        ...assetsRoutes,
        ...genesisRoutes,
        ...governanceRoutes,
        ...marketsRoutes,
        ...networkParametersRoutes,
        ...validators,
        ...treasuryRoutes,
      ],
    },
    {
      path: Routes.RESTRICTED,
      element: <RestrictedPage />,
      handle: {
        name: t('Restricted'),
        text: t('Restricted'),
      },
    },
  ];
  return routerConfig;
};
