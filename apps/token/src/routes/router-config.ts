import React from "react";

import Home from "./home";
import NotFound from "./not-found";
import NotPermitted from "./not-permitted";

export const Routes = {
  HOME: "/",
  TRANCHES: "/tranches",
  CLAIM: "/claim",
  STAKING: "/staking",
  REWARDS: "/rewards",
  WITHDRAW: "/withdraw",
  WITHDRAWALS: "/withdrawals",
  GOVERNANCE: "/governance",
  VESTING: "/vesting",
  LIQUIDITY: "/liquidity",
  NOT_PERMITTED: "/not-permitted",
  NOT_FOUND: "/not-found",
  CONTRACTS: "/contracts",
};

const LazyTranches = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches", webpackPrefetch: true */ "./tranches"
    )
);

const LazyClaim = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-claim", webpackPrefetch: true */ "./claim"
    )
);

const LazyRedemption = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-redemption", webpackPrefetch: true */ "./redemption"
    )
);
const LazyStaking = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking", webpackPrefetch: true */ "./staking"
    )
);
const LazyLiquidity = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-liquidity", webpackPrefetch: true */ "./liquidity"
    )
);
const LazyGovernance = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance", webpackPrefetch: true */ "./governance"
    )
);
const LazyRewards = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-rewards", webpackPrefetch: true */ "./rewards"
    )
);

const LazyContracts = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches", webpackPrefetch: true */ "./contracts"
    )
);

const LazyWithdraw = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-withdraw", webpackPrefetch: true */ "./withdraw"
    )
);

const LazyWithdrawals = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-withdrawals", webpackPrefetch: true */ "./withdrawals"
    )
);

const routerConfig = [
  {
    path: Routes.HOME,
    name: "Home",
    // Not lazy as loaded when a user first hits the site
    component: Home,
    exact: true,
  },
  {
    path: Routes.TRANCHES,
    name: "Tranches",
    component: LazyTranches,
  },
  {
    path: Routes.CLAIM,
    name: "Claim",
    component: LazyClaim,
  },
  {
    path: Routes.STAKING,
    name: "Staking",
    component: LazyStaking,
  },
  {
    path: Routes.REWARDS,
    name: "Rewards",
    component: LazyRewards,
  },
  {
    path: Routes.WITHDRAW,
    name: "Withdraw",
    component: LazyWithdraw,
  },
  {
    path: Routes.WITHDRAWALS,
    name: "Withdrawals",
    component: LazyWithdrawals,
  },
  {
    path: Routes.VESTING,
    name: "Vesting",
    component: LazyRedemption,
  },
  {
    path: Routes.LIQUIDITY,
    name: "DEX Liquidity",
    component: LazyLiquidity,
  },
  {
    path: Routes.GOVERNANCE,
    name: "Governance",
    component: LazyGovernance,
  },
  {
    path: Routes.NOT_PERMITTED,
    name: "Not permitted",
    // Not lazy as loaded when a user first hits the site
    component: NotPermitted,
  },
  {
    path: Routes.CONTRACTS,
    name: "Contracts",
    component: LazyContracts,
  },
  {
    name: "NotFound",
    // Not lazy as loaded when a user first hits the site
    component: NotFound,
  },
];

export default routerConfig;
