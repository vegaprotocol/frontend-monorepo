const Routes = {
  HOME: '/',
  VALIDATORS: '/validators',
  REWARDS: '/rewards',
  PROPOSALS: '/proposals',
  PROPOSALS_REJECTED: '/proposals/rejected',
  PROTOCOL_UPGRADES: '/protocol-upgrades',
  NOT_PERMITTED: '/not-permitted',
  RESTRICTED: '/restricted',
  NOT_FOUND: '/not-found',
  CONTRACTS: '/contracts',
  TOKEN: '/token',
  WITHDRAWALS: '/token/withdraw',
  ASSOCIATE: '/token/associate',
  DISASSOCIATE: '/token/disassociate',
  DISCLAIMER: '/disclaimer',
};

export default Routes;

export const TOP_LEVEL_ROUTES = [
  {
    name: 'Proposals',
    path: Routes.PROPOSALS,
  },
  {
    name: 'Validators',
    path: Routes.VALIDATORS,
  },
  {
    name: 'Rewards',
    path: Routes.REWARDS,
  },
];

export const TOKEN_DROPDOWN_ROUTES = [
  {
    name: 'Token',
    path: Routes.TOKEN,
    end: true,
  },
  {
    name: 'Withdraw',
    path: Routes.WITHDRAWALS,
  },
  {
    name: 'Associate',
    path: Routes.ASSOCIATE,
  },
  {
    name: 'Disassociate',
    path: Routes.DISASSOCIATE,
  },
];
