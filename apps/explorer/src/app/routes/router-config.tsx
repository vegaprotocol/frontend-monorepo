import Assets from './assets';
import BlockPage from './blocks';
import Governance from './governance';
import Home from './home';
import Markets from './markets';
import Party from './parties';
import { Parties } from './parties/home';
import { Party as PartySingle } from './parties/id';
import Txs from './txs';
import Validators from './validators';
import Genesis from './genesis';
import { Block } from './blocks/id';
import { Blocks } from './blocks/home';
import { Tx } from './txs/id';
import { Txs as TxHome } from './txs/home';
import { PendingTxs } from './pending';
import flags from '../config/flags';
import { t } from '@vegaprotocol/react-helpers';
import { Routes } from './route-names';
import { NetworkParameters } from './network-parameters';

const partiesRoutes = flags.parties
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

const assetsRoutes = flags.assets
  ? [
      {
        path: Routes.ASSETS,
        text: t('Assets'),
        name: 'Assets',
        element: <Assets />,
      },
    ]
  : [];

const genesisRoutes = flags.genesis
  ? [
      {
        path: Routes.GENESIS,
        name: 'Genesis',
        text: t('Genesis Parameters'),
        element: <Genesis />,
      },
    ]
  : [];

const governanceRoutes = flags.governance
  ? [
      {
        path: Routes.GOVERNANCE,
        name: 'Governance',
        text: t('Proposals'),
        element: <Governance />,
      },
    ]
  : [];

const marketsRoutes = flags.markets
  ? [
      {
        path: Routes.MARKETS,
        name: 'Markets',
        text: t('Markets'),
        element: <Markets />,
      },
    ]
  : [];

const networkParametersRoutes = flags.networkParameters
  ? [
      {
        path: Routes.NETWORK_PARAMETERS,
        name: 'NetworkParameters',
        text: t('Network Parameters'),
        element: <NetworkParameters />,
      },
    ]
  : [];
const validators = flags.validators
  ? [
      {
        path: Routes.VALIDATORS,
        name: 'Validators',
        text: t('Validators'),
        element: <Validators />,
      },
    ]
  : [];

const routerConfig = [
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
        element: <TxHome />,
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
  ...partiesRoutes,
  ...assetsRoutes,
  ...genesisRoutes,
  ...governanceRoutes,
  ...marketsRoutes,
  ...networkParametersRoutes,
  ...validators,
];

export default routerConfig;
