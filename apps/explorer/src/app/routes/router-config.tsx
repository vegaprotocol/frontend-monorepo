import { AssetPage, AssetsPage } from './assets';
import BlockPage from './blocks';
import Governance from './governance';
import Home from './home';
import OraclePage from './oracles';
import Oracles from './oracles/home';
import { Oracle } from './oracles/id';
import Party from './parties';
import { Parties } from './parties/home';
import { Party as PartySingle } from './parties/id';
import Txs from './txs';
import Validators from './validators';
import Genesis from './genesis';
import { Block } from './blocks/id';
import { Blocks } from './blocks/home';
import { Tx } from './txs/id';
import { TxsList } from './txs/home';
import { PendingTxs } from './pending';
import flags from '../config/flags';
import { t } from '@vegaprotocol/react-helpers';
import { Routes } from './route-names';
import { NetworkParameters } from './network-parameters';
import type { RouteObject } from 'react-router-dom';
import { MarketPage, MarketsPage } from './markets';

export type Navigable = { path: string; name: string; text: string };
type Route = RouteObject & Navigable;

const partiesRoutes: Route[] = flags.parties
  ? [
      {
        path: Routes.PARTIES,
        name: 'Parties',
        text: t('Parties'),
        element: <Party />,
        children: [
          {
            index: true,
            element: <Parties />,
          },
          {
            path: ':party',
            element: <PartySingle />,
          },
        ],
      },
    ]
  : [];

const assetsRoutes: Route[] = flags.assets
  ? [
      {
        path: Routes.ASSETS,
        text: t('Assets'),
        name: 'Assets',
        children: [
          {
            index: true,
            element: <AssetsPage />,
          },
          {
            path: ':assetId',
            element: <AssetPage />,
          },
        ],
      },
    ]
  : [];

const genesisRoutes: Route[] = flags.genesis
  ? [
      {
        path: Routes.GENESIS,
        name: 'Genesis',
        text: t('Genesis Parameters'),
        element: <Genesis />,
      },
    ]
  : [];

const governanceRoutes: Route[] = flags.governance
  ? [
      {
        path: Routes.GOVERNANCE,
        name: 'Governance proposals',
        text: t('Governance Proposals'),
        element: <Governance />,
      },
    ]
  : [];

const marketsRoutes: Route[] = flags.markets
  ? [
      {
        path: Routes.MARKETS,
        name: 'Markets',
        text: t('Markets'),
        children: [
          {
            index: true,
            element: <MarketsPage />,
          },
          {
            path: ':marketId',
            element: <MarketPage />,
          },
        ],
      },
    ]
  : [];

const networkParametersRoutes: Route[] = flags.networkParameters
  ? [
      {
        path: Routes.NETWORK_PARAMETERS,
        name: 'NetworkParameters',
        text: t('Network Parameters'),
        element: <NetworkParameters />,
      },
    ]
  : [];
const validators: Route[] = flags.validators
  ? [
      {
        path: Routes.VALIDATORS,
        name: 'Validators',
        text: t('Validators'),
        element: <Validators />,
      },
    ]
  : [];

const routerConfig: Route[] = [
  {
    path: Routes.HOME,
    name: 'Home',
    text: t('Home'),
    element: <Home />,
    index: true,
  },
  {
    path: Routes.TX,
    name: 'Txs',
    text: t('Transactions'),
    element: <Txs />,
    children: [
      {
        path: 'pending',
        element: <PendingTxs />,
      },
      {
        path: ':txHash',
        element: <Tx />,
      },
      {
        index: true,
        element: <TxsList />,
      },
    ],
  },
  {
    path: Routes.BLOCKS,
    name: 'Blocks',
    text: t('Blocks'),
    element: <BlockPage />,
    children: [
      {
        index: true,
        element: <Blocks />,
      },
      {
        path: ':block',
        element: <Block />,
      },
    ],
  },
  {
    path: Routes.ORACLES,
    name: 'Oracles',
    text: t('Oracles'),
    element: <OraclePage />,
    children: [
      {
        index: true,
        element: <Oracles />,
      },
      {
        path: ':id',
        element: <Oracle />,
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
];

export default routerConfig;
