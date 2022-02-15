import Assets from "./assets";
import Blocks from "./blocks";
import Governance from "./governance";
import Home from "./home";
import Markets from "./markets";
import Party from "./parties";
import Txs from "./txs";
import Validators from "./validators";
import Genesis from "./genesis";
import NetworkParameters from "./network-parameters";

export const Routes = {
  HOME: "/",
  TX: "/txs",
  BLOCKS: "/blocks",
  PARTIES: "/parties",
  VALIDATORS: "/validators",
  ASSETS: "/assets",
  GENESIS: "/genesis",
  GOVERNANCE: "/governance",
  MARKETS: "/markets",
  NETWORK_PARAMETERS: "/network-parameters",
};

const routerConfig = [
  {
    path: Routes.HOME,
    name: "Home",
    component: Home,
    exact: true,
  },
  {
    path: Routes.TX,
    name: "Txs",
    component: Txs,
  },
  {
    path: Routes.BLOCKS,
    name: "Blocks",
    component: Blocks,
  },
  {
    path: Routes.PARTIES,
    name: "Parties",
    component: Party,
  },
  {
    path: Routes.ASSETS,
    name: "Assets",
    component: Assets,
  },
  {
    path: Routes.GENESIS,
    name: "Genesis",
    component: Genesis,
  },
  {
    path: Routes.GOVERNANCE,
    name: "Governance",
    component: Governance,
  },
  {
    path: Routes.MARKETS,
    name: "Markets",
    component: Markets,
  },
  {
    path: Routes.NETWORK_PARAMETERS,
    name: "NetworkParameters",
    component: NetworkParameters,
  },
  {
    path: Routes.VALIDATORS,
    name: "Validators",
    component: Validators,
  },
];

export default routerConfig;
