import React from 'react';
import Home from './home';
import NotFound from './not-found';
import NotPermitted from './not-permitted';
import Routes from './routes';

const LazyTranches = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches", webpackPrefetch: true */ './tranches'
    )
);

const LazyTranchesTranche = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches-tranche", webpackPrefetch: true */ './tranches/tranche'
    )
);

const LazyTranchesTranches = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches-tranches", webpackPrefetch: true */ './tranches/tranches'
    )
);

const LazyClaim = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-claim", webpackPrefetch: true */ './claim'
    )
);

const LazyRedemption = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-redemption", webpackPrefetch: true */ './redemption'
    )
);

const LazyRedemptionIndex = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-redemption-index", webpackPrefetch: true */ './redemption/home/redemption-information'
    )
);

const LazyRedemptionTranche = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-redemption-tranche", webpackPrefetch: true */ './redemption/tranche'
    )
);
const LazyStaking = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking", webpackPrefetch: true */ './staking'
    )
);

const LazyStakingAssociate = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-associate", webpackPrefetch: true */ './staking/associate/associate-page-container'
    )
);

const LazyStakingDisassociate = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-disassociate", webpackPrefetch: true */ './staking/disassociate/disassociate-page-container'
    )
);

const LazyStakingIndex = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-index", webpackPrefetch: true */ './staking/staking'
    )
);

const LazyStakingNode = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-node", webpackPrefetch: true */ './staking/staking-node'
    )
);

const LazyStakingNodes = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-nodes", webpackPrefetch: true */ './staking/staking-nodes-container'
    )
);

const LazyGovernance = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance", webpackPrefetch: true */ './governance'
    )
);

const LazyGovernanceProposal = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-proposal", webpackPrefetch: true */ './governance/proposal'
    )
);

const LazyGovernanceProposals = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-proposals", webpackPrefetch: true */ './governance/proposals'
    )
);

const LazyGovernancePropose = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose", webpackPrefetch: true */ './governance/propose'
    )
);

const LazyRewards = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-rewards", webpackPrefetch: true */ './rewards'
    )
);

const LazyContracts = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches", webpackPrefetch: true */ './contracts'
    )
);

const LazyWithdraw = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-withdraw", webpackPrefetch: true */ './withdraw'
    )
);

const LazyWithdrawals = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-withdrawals", webpackPrefetch: true */ './withdrawals'
    )
);

const routerConfig = [
  {
    path: Routes.HOME,
    name: 'Home',
    // Not lazy as loaded when a user first hits the site
    component: Home,
  },
  {
    path: Routes.TRANCHES,
    name: 'Tranches',
    component: LazyTranches,
    children: [
      { index: true, element: <LazyTranchesTranches /> },
      { path: ':trancheId', element: <LazyTranchesTranche /> },
    ],
  },
  {
    path: Routes.CLAIM,
    name: 'Claim',
    component: LazyClaim,
  },
  {
    path: Routes.STAKING,
    name: 'Staking',
    component: LazyStaking,
    children: [
      { path: 'associate', element: <LazyStakingAssociate /> },
      { path: 'disassociate', element: <LazyStakingDisassociate /> },
      { path: ':node', element: <LazyStakingNode /> },
      {
        index: true,
        element: (
          <LazyStakingNodes>
            {({ data }) => <LazyStakingIndex data={data} />}
          </LazyStakingNodes>
        ),
      },
    ],
  },
  {
    path: Routes.REWARDS,
    name: 'Rewards',
    component: LazyRewards,
  },
  {
    path: Routes.WITHDRAW,
    name: 'Withdraw',
    component: LazyWithdraw,
  },
  {
    path: Routes.WITHDRAWALS,
    name: 'Withdrawals',
    component: LazyWithdrawals,
  },
  {
    path: Routes.VESTING,
    name: 'Vesting',
    component: LazyRedemption,
    children: [
      {
        index: true,
        element: <LazyRedemptionIndex />,
      },
      {
        path: ':id',
        element: <LazyRedemptionTranche />,
      },
    ],
  },
  {
    path: Routes.GOVERNANCE,
    name: 'Governance',
    component: LazyGovernance,
    children: [
      { path: ':proposalId', element: <LazyGovernanceProposal /> },
      { path: 'propose', element: <LazyGovernancePropose /> },
      { index: true, element: <LazyGovernanceProposals /> },
    ],
  },
  {
    path: Routes.NOT_PERMITTED,
    name: 'Not permitted',
    // Not lazy as loaded when a user first hits the site
    component: NotPermitted,
  },
  {
    path: Routes.CONTRACTS,
    name: 'Contracts',
    component: LazyContracts,
  },
  {
    path: '*',
    name: 'NotFound',
    // Not lazy as loaded when a user first hits the site
    component: NotFound,
  },
];

export default routerConfig;
