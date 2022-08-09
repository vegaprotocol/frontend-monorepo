import React from 'react';
import { ProposalContainer } from './governance/proposal';
import { ProposalsContainer } from './governance/proposals';
import { Propose } from './governance/propose';

import Home from './home';
import NotFound from './not-found';
import NotPermitted from './not-permitted';
import { RedemptionInformation } from './redemption/home/redemption-information';
import { RedeemFromTranche } from './redemption/tranche';
import { AssociateContainer } from './staking/associate/associate-page-container';
import { DisassociateContainer } from './staking/disassociate/disassociate-page-container';
import { Staking } from './staking/staking';
import { StakingNodeContainer } from './staking/staking-node';
import { StakingNodesContainer } from './staking/staking-nodes-container';
import { Tranche } from './tranches/tranche';
import { Tranches } from './tranches/tranches';
import Routes from './routes';

const LazyTranches = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-tranches", webpackPrefetch: true */ './tranches'
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
const LazyStaking = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-staking", webpackPrefetch: true */ './staking'
    )
);
const LazyGovernance = React.lazy(
  () =>
    import(
      /* webpackChunkName: "route-governance", webpackPrefetch: true */ './governance'
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
      { index: true, element: <Tranches /> },
      { path: ':trancheId', element: <Tranche /> },
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
      { path: 'associate', element: <AssociateContainer /> },
      { path: 'disassociate', element: <DisassociateContainer /> },
      { path: ':node', element: <StakingNodeContainer /> },
      {
        index: true,
        element: (
          <StakingNodesContainer>
            {({ data }) => <Staking data={data} />}
          </StakingNodesContainer>
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
        element: <RedemptionInformation />,
      },
      {
        path: ':id',
        element: <RedeemFromTranche />,
      },
    ],
  },
  {
    path: Routes.GOVERNANCE,
    name: 'Governance',
    component: LazyGovernance,
    children: [
      { path: ':proposalId', element: <ProposalContainer /> },
      { path: 'propose', element: <Propose /> },
      { index: true, element: <ProposalsContainer /> },
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
