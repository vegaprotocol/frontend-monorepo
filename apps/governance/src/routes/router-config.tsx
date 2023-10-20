import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Home from './token';
import NotFound from './not-found';
import NotPermitted from './not-permitted';
import Routes from './routes';
import Restricted from './restricted';

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

const LazyHome = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-home", webpackPrefetch: true */ './home'
    )
);

const LazyProposals = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance", webpackPrefetch: true */ './proposals'
    )
);

const LazyProposal = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-proposal", webpackPrefetch: true */ './proposals/proposal'
    )
);

const LazyProtocolUpgradeProposal = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-protocol-upgrade-proposal", webpackPrefetch: true */ './proposals/protocol-upgrade'
    )
);

const LazyProposalsList = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-proposals", webpackPrefetch: true */ './proposals/proposals'
    )
);

const LazyRejectedProposalsList = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-proposals", webpackPrefetch: true */ './proposals/rejected'
    )
);

const LazyPropose = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose", webpackPrefetch: true */ './proposals/propose'
    )
);

const LazyProposeNetworkParameter = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-network-parameter", webpackPrefetch: true */ './proposals/propose/network-parameter'
    )
);

const LazyProposeNewMarket = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-new-market", webpackPrefetch: true */ './proposals/propose/new-market'
    )
);

const LazyProposeUpdateMarket = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-update-market", webpackPrefetch: true */ './proposals/propose/update-market'
    )
);

const LazyProposeNewAsset = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-new-asset", webpackPrefetch: true */ './proposals/propose/new-asset'
    )
);

const LazyProposeUpdateAsset = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-update-asset", webpackPrefetch: true */ './proposals/propose/update-asset'
    )
);

const LazyProposeFreeform = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-freeform", webpackPrefetch: true */ './proposals/propose/freeform'
    )
);

const LazyProposeRaw = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance-propose-raw", webpackPrefetch: true */ './proposals/propose/raw'
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

const LazyDisclaimer = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-disclaimer", webpackPrefetch: true */ './disclaimer'
    )
);

const redirects = [
  {
    path: Routes.VALIDATORS,
    element: <Navigate to={Routes.VALIDATORS} replace />,
  },
  {
    path: '/tranches',
    element: <Navigate to={Routes.SUPPLY} replace />,
  },
  {
    path: '/withdrawals',
    element: <Navigate to={Routes.WITHDRAWALS} replace />,
  },
  {
    path: '/vesting',
    element: <Navigate to={Routes.REDEEM} replace />,
  },
  {
    path: Routes.PROTOCOL_UPGRADES,
    element: <Navigate to={Routes.PROPOSALS} replace />,
  },
];

const routerConfig = [
  {
    path: Routes.HOME,
    element: <LazyHome name="Home" />,
  },
  {
    path: Routes.PROPOSALS,
    element: <LazyProposals name="Proposals" />,
    children: [
      { index: true, element: <LazyProposalsList /> },
      {
        path: 'propose',
        element: <Outlet />,
        children: [
          { index: true, element: <LazyPropose /> },
          {
            path: 'network-parameter',
            element: <LazyProposeNetworkParameter />,
          },
          {
            path: 'new-market',
            element: <LazyProposeNewMarket />,
          },
          {
            path: 'update-market',
            element: <LazyProposeUpdateMarket />,
          },
          { path: 'new-asset', element: <LazyProposeNewAsset /> },
          {
            path: 'update-asset',
            element: <LazyProposeUpdateAsset />,
          },
          { path: 'freeform', element: <LazyProposeFreeform /> },
          { path: 'raw', element: <LazyProposeRaw /> },
        ],
      },
      { path: 'proposals', element: <LazyProposalsList /> },
      { path: ':proposalId', element: <LazyProposal /> },
      { path: 'rejected', element: <LazyRejectedProposalsList /> },
    ],
  },
  {
    path: `${Routes.PROTOCOL_UPGRADES}/:proposalReleaseTag/:proposalBlockHeight`,
    element: <LazyProtocolUpgradeProposal />,
  },
  {
    path: Routes.VALIDATORS,
    element: <LazyStaking name="Staking" />,
    children: [
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
        element: <Home name="Token" />,
        index: true,
      },
      {
        path: Routes.SUPPLY,
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
        path: Routes.REDEEM,
        element: <LazyRedemption name="Vesting" />,
        children: [
          {
            path: ':address',
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
      { path: 'associate', element: <LazyStakingAssociate name="Associate" /> },
      {
        path: 'disassociate',
        element: <LazyStakingDisassociate name="Disassociate" />,
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
    path: Routes.DISCLAIMER,
    element: <LazyDisclaimer name="Disclaimer" />,
  },
  {
    path: Routes.RESTRICTED,
    // Not lazy as loaded when a user first hits the site
    element: <Restricted name="451 Unavailable" />,
  },
  {
    path: '*',
    // Also not lazy as loaded when a user first hits the site
    element: <NotFound name="NotFound" />,
  },
  ...redirects,
];

export default routerConfig;
