import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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
      /* webpackChunkName: "route-staking-disassociate", webpackPrefetch: true */ './staking/disassociate'
    )
);

const LazyStakingIndex = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-index", webpackPrefetch: true */ './staking/home'
    )
);

const LazyStakingNode = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking-node", webpackPrefetch: true */ './staking/node'
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

const LazyRejectedGovernanceProposals = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-proposals", webpackPrefetch: true */ './governance/rejected'
    )
);

const LazyGovernancePropose = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose", webpackPrefetch: true */ './governance/propose'
    )
);

const LazyGovernanceProposeNetworkParameter = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-network-parameter", webpackPrefetch: true */ './governance/propose/network-parameter'
    )
);

const LazyGovernanceProposeNewMarket = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-new-market", webpackPrefetch: true */ './governance/propose/new-market'
    )
);

const LazyGovernanceProposeUpdateMarket = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-update-market", webpackPrefetch: true */ './governance/propose/update-market'
    )
);

const LazyGovernanceProposeNewAsset = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-new-asset", webpackPrefetch: true */ './governance/propose/new-asset'
    )
);

const LazyGovernanceProposeUpdateAsset = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-update-asset", webpackPrefetch: true */ './governance/propose/update-asset'
    )
);

const LazyGovernanceProposeFreeform = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-freeform", webpackPrefetch: true */ './governance/propose/freeform'
    )
);

const LazyGovernanceProposeRaw = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-raw", webpackPrefetch: true */ './governance/propose/raw'
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

const LazyWithdrawals = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-withdrawals", webpackPrefetch: true */ './withdrawals'
    )
);

const routerConfig = [
  {
    path: Routes.PROPOSALS,
    element: <LazyGovernance name="Governance" />,
    children: [
      { index: true, element: <LazyGovernanceProposals /> },
      {
        path: 'propose',
        element: <Outlet />,
        children: [
          { index: true, element: <LazyGovernancePropose /> },
          {
            path: 'network-parameter',
            element: <LazyGovernanceProposeNetworkParameter />,
          },
          {
            path: 'new-market',
            element: <LazyGovernanceProposeNewMarket />,
          },
          {
            path: 'update-market',
            element: <LazyGovernanceProposeUpdateMarket />,
          },
          { path: 'new-asset', element: <LazyGovernanceProposeNewAsset /> },
          {
            path: 'update-asset',
            element: <LazyGovernanceProposeUpdateAsset />,
          },
          { path: 'freeform', element: <LazyGovernanceProposeFreeform /> },
          { path: 'raw', element: <LazyGovernanceProposeRaw /> },
        ],
      },
      { path: ':proposalId', element: <LazyGovernanceProposal /> },
      { path: 'rejected', element: <LazyRejectedGovernanceProposals /> },
    ],
  },
  {
    path: Routes.HOME,
    element: <Navigate to={Routes.PROPOSALS} replace />,
  },
  {
    path: Routes.STAKING,
    element: <Navigate to={Routes.VALIDATORS} replace />,
  },
  {
    path: Routes.VALIDATORS,
    element: <LazyStaking name="Staking" />,
    children: [
      { path: 'associate', element: <LazyStakingAssociate /> },
      { path: 'disassociate', element: <LazyStakingDisassociate /> },
      { path: ':node', element: <LazyStakingNode /> },
      {
        index: true,
        element: <LazyStakingIndex />,
      },
    ],
  },
  {
    path: Routes.REWARDS,
    element: <LazyRewards name="Rewards" />,
  },
  {
    path: Routes.TOKEN,
    // Not lazy as loaded when a user first hits the site
    children: [
      {
        element: <Home name="Home" />,
        index: true,
      },
      {
        path: Routes.TRANCHES,
        element: <LazyTranches name="Tranches" />,
        children: [
          { index: true, element: <LazyTranchesTranches /> },
          { path: ':trancheId', element: <LazyTranchesTranche /> },
        ],
      },
      {
        path: Routes.WITHDRAWALS,
        element: <LazyWithdrawals name="Withdrawals" />,
      },
      {
        path: Routes.VESTING,
        element: <LazyRedemption name="Vesting" />,
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
    ],
  },
  {
    path: Routes.CLAIM,
    element: <LazyClaim name="Claim" />,
  },
  {
    path: Routes.NOT_PERMITTED,
    // Not lazy as loaded when a user first hits the site
    element: <NotPermitted name="Not permitted" />,
  },
  {
    path: Routes.CONTRACTS,
    element: <LazyContracts name="Contracts" />,
  },
  {
    path: '*',
    // Not lazy as loaded when a user first hits the site
    element: <NotFound name="NotFound" />,
  },
];

export default routerConfig;
