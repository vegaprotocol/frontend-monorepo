const Routes = {
  HOME: '/',
  CLAIM: '/claim',
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
  REDEEM: '/token/redeem',
  WITHDRAWALS: '/token/withdraw',
  SUPPLY: '/token/tranches',
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
  {
    name: 'Restricted',
    path: Routes.RESTRICTED,
  },
];

export const TOKEN_DROPDOWN_ROUTES = [
  {
    name: 'Token',
    path: Routes.TOKEN,
    end: true,
  },
  {
    name: 'Supply & Vesting',
    path: Routes.SUPPLY,
  },
  {
    name: 'Withdraw',
    path: Routes.WITHDRAWALS,
  },
  {
    name: 'Redeem',
    path: Routes.REDEEM,
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
