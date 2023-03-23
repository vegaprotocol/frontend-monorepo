import { AssetPage, AssetsPage } from './assets';
import BlockPage from './blocks';
import { Proposals } from './governance';
import Home from './home';
import OraclePage from './oracles';
import Oracles from './oracles/home';
import { Oracle } from './oracles/id';
import Party from './parties';
import { Parties } from './parties/home';
import { Party as PartySingle } from './parties/id';
import { ValidatorsPage } from './validators';
import Genesis from './genesis';
import { Block } from './blocks/id';
import { Blocks } from './blocks/home';
import { Tx } from './txs/id';
import { TxsList } from './txs/home';
import { PendingTxs } from './pending';
import flags from '../config/flags';
import { t } from '@vegaprotocol/i18n';
import { Routes } from './route-names';
import { NetworkParameters } from './network-parameters';
import type { Params, RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MarketPage, MarketsPage } from './markets';
<<<<<<< HEAD
import type { ReactNode } from 'react';
import { ErrorBoundary, Layout } from './layout';
import compact from 'lodash/compact';
import { AssetLink, MarketLink } from '../components/links';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { remove0x } from '@vegaprotocol/utils';
=======
import { PartyAccountsByAsset } from './parties/id/accounts';
>>>>>>> 43fddbc51 (feat(explorer): make separate accounts route)

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

const partiesRoutes: Route[] = flags.parties
  ? [
      {
        path: Routes.PARTIES,
        element: <Party />,
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
            element: <PartySingle />,
            handle: {
              breadcrumb: (params: Params<string>) => (
                <Link to={linkTo(Routes.PARTIES, params.party)}>
                  {truncateMiddle(params.party as string)}
                </Link>
              ),
            },
          },
          {
            path: ':party/accounts',
            element: <PartyAccountsByAsset />,
          },
        ],
      },
    ]
  : [];

const assetsRoutes: Route[] = flags.assets
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

const genesisRoutes: Route[] = flags.genesis
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

const governanceRoutes: Route[] = flags.governance
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

const marketsRoutes: Route[] = flags.markets
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
            element: <MarketPage />,
            handle: {
              breadcrumb: (params: Params<string>) => (
                <MarketLink id={params.marketId as string} />
              ),
            },
          },
        ],
      },
    ]
  : [];

const networkParametersRoutes: Route[] = flags.networkParameters
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

const validators: Route[] = flags.validators
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

export const routerConfig: Route[] = [
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
            path: 'pending',
            element: <PendingTxs />,
            handle: {
              breadcrumb: () => (
                <Link to={linkTo(Routes.TX, 'pending')}>
                  {t('Pending transactions')}
                </Link>
              ),
            },
          },
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
      ...partiesRoutes,
      ...assetsRoutes,
      ...genesisRoutes,
      ...governanceRoutes,
      ...marketsRoutes,
      ...networkParametersRoutes,
      ...validators,
    ],
  },
];

export const router = createBrowserRouter(routerConfig);
