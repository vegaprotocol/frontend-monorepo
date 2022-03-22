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
import NetworkParameters from './network-parameters';
import { Block } from './blocks/id';
import { Blocks } from './blocks/home';
import { Tx } from './txs/id';
import { Txs as TxHome } from './txs/home';
import { PendingTxs } from './pending';
import flags from '../lib/flags';
export const Routes = {
  HOME: '/',
  TX: 'txs',
  BLOCKS: 'blocks',
  PARTIES: 'parties',
  VALIDATORS: 'validators',
  ASSETS: 'assets',
  GENESIS: 'genesis',
  GOVERNANCE: 'governance',
  MARKETS: 'markets',
  NETWORK_PARAMETERS: 'network-parameters',
};

const partiesRoutes = flags.parties
  ? [
      {
        path: Routes.PARTIES,
        name: 'Parties',
        text: 'Parties',
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
        text: 'Assets',
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
        text: 'Genesis parameters',
        element: <Genesis />,
      },
    ]
  : [];

const governanceRoutes = flags.governance
  ? [
      {
        path: Routes.GOVERNANCE,
        name: 'Governance',
        text: 'Proposals',
        element: <Governance />,
      },
    ]
  : [];

const marketsRoutes = flags.markets
  ? [
      {
        path: Routes.MARKETS,
        name: 'Markets',
        text: 'Markets',
        element: <Markets />,
      },
    ]
  : [];

const networkParametersRoutes = flags.networkParameters
  ? [
      {
        path: Routes.NETWORK_PARAMETERS,
        name: 'NetworkParameters',
        text: 'Network parameters',
        element: <NetworkParameters />,
      },
    ]
  : [];
const validators = flags.validators
  ? [
      {
        path: Routes.VALIDATORS,
        name: 'Validators',
        text: 'Validators',
        element: <Validators />,
      },
    ]
  : [];

const routerConfig = [
  {
    path: Routes.HOME,
    name: 'Home',
    text: 'Home',
    element: <Home />,
    index: true,
  },
  {
    path: Routes.TX,
    name: 'Txs',
    text: 'Transactions',
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
    text: 'Blocks',
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
