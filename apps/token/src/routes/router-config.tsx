import React from 'react';
import { ProposalContainer } from './governance/proposal';
import { ProposalsContainer } from './governance/proposals';

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
import Withdraw from './withdraw';
import Withdrawals from './withdrawals';
import Governance from './governance';
import Contracts from './contracts';
import Rewards from './rewards';
import Vesting from './redemption';
import Claim from './claim';
import StakingHome from './staking';
import TranchesHome from './tranches';

export const Routes = {
  HOME: '/',
  TRANCHES: '/tranches',
  CLAIM: '/claim',
  STAKING: '/staking',
  REWARDS: '/rewards',
  WITHDRAW: '/withdraw',
  WITHDRAWALS: '/withdrawals',
  GOVERNANCE: '/governance',
  VESTING: '/vesting',
  NOT_PERMITTED: '/not-permitted',
  NOT_FOUND: '/not-found',
  CONTRACTS: '/contracts',
};

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
    component: TranchesHome,
    children: [
      { index: true, element: <Tranches /> },
      { path: ':trancheId', element: <Tranche /> },
    ],
  },
  {
    path: Routes.CLAIM,
    name: 'Claim',
    component: Claim,
  },
  {
    path: Routes.STAKING,
    name: 'Staking',
    component: StakingHome,
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
    component: Rewards,
  },
  {
    path: Routes.WITHDRAW,
    name: 'Withdraw',
    component: Withdraw,
  },
  {
    path: Routes.WITHDRAWALS,
    name: 'Withdrawals',
    component: Withdrawals,
  },
  {
    path: Routes.VESTING,
    name: 'Vesting',
    component: Vesting,
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
    component: Governance,
    children: [
      { index: true, element: <ProposalsContainer /> },
      { path: ':proposalId', element: <ProposalContainer /> },
    ],
  },
  {
    path: Routes.CONTRACTS,
    name: 'Contracts',
    component: Contracts,
  },
  {
    path: Routes.NOT_PERMITTED,
    name: 'Not permitted',
    // Not lazy as loaded when a user first hits the site
    component: NotPermitted,
  },
  {
    path: '*',
    name: 'NotFound',
    // Not lazy as loaded when a user first hits the site
    component: NotFound,
  },
];

export default routerConfig;
