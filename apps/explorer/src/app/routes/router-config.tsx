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

const routerConfig = [
  {
    path: Routes.HOME,
    name: 'Home',
    element: <Home />,
    index: true,
  },
  {
    path: Routes.TX,
    name: 'Txs',
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
    path: Routes.PARTIES,
    name: 'Parties',
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
  {
    path: Routes.ASSETS,
    name: 'Assets',
    element: <Assets />,
  },
  {
    path: Routes.GENESIS,
    name: 'Genesis',
    element: <Genesis />,
  },
  {
    path: Routes.GOVERNANCE,
    name: 'Governance',
    element: <Governance />,
  },
  {
    path: Routes.MARKETS,
    name: 'Markets',
    element: <Markets />,
  },
  {
    path: Routes.NETWORK_PARAMETERS,
    name: 'NetworkParameters',
    element: <NetworkParameters />,
  },
  {
    path: Routes.VALIDATORS,
    name: 'Validators',
    element: <Validators />,
  },
];

export default routerConfig;
