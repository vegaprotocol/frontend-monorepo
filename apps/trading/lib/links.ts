import trimEnd from 'lodash/trimEnd';

// Make all route paths 'absolute' for easier
// href creation
export const Routes = {
  HOME: '/',
  MARKETS: '/markets',
  MARKET: '/markets/:marketId',
  LIQUIDITY: '/liquidity/:marketId',
  PORTFOLIO: '/portfolio',
  DISCLAIMER: '/disclaimer',
  ASSETS: '/portfolio/assets',
  DEPOSIT: '/portfolio/assets/deposit',
  WITHDRAW: '/portfolio/assets/withdraw',
  TRANSFER: '/portfolio/assets/transfer',
  REFERRALS: '/referrals',
  REFERRALS_APPLY_CODE: '/referrals/apply-code',
  REFERRALS_CREATE_CODE: '/referrals/create-code',
  COMPETITIONS: '/competitions',
  COMPETITIONS_TEAMS: '/competitions/teams',
  COMPETITIONS_TEAM: '/competitions/teams/:teamId',
  COMPETITIONS_CREATE_TEAM: '/competitions/teams/create',
  COMPETITIONS_CREATE_TEAM_SOLO: '/competitions/teams/create?solo=true',
  COMPETITIONS_UPDATE_TEAM: '/competitions/teams/:teamId/update',
  COMPETITIONS_GAME: '/competitions/games/:gameId',
  FEES: '/fees',
  REWARDS: '/rewards',
} as const;

type ConsoleLinks = {
  [R in keyof typeof Routes]: (...args: string[]) => string;
};

export const Links: ConsoleLinks = {
  HOME: () => Routes.HOME,
  MARKET: (marketId: string) =>
    trimEnd(Routes.MARKET.replace(':marketId', marketId)),
  MARKETS: () => Routes.MARKETS,
  PORTFOLIO: () => Routes.PORTFOLIO,
  LIQUIDITY: (marketId: string) =>
    trimEnd(Routes.LIQUIDITY.replace(':marketId', marketId)),
  DISCLAIMER: () => Routes.DISCLAIMER,
  ASSETS: () => Routes.ASSETS,
  DEPOSIT: () => Routes.DEPOSIT,
  WITHDRAW: () => Routes.WITHDRAW,
  TRANSFER: () => Routes.TRANSFER,
  REFERRALS: () => Routes.REFERRALS,
  REFERRALS_APPLY_CODE: () => Routes.REFERRALS_APPLY_CODE,
  REFERRALS_CREATE_CODE: () => Routes.REFERRALS_CREATE_CODE,
  COMPETITIONS: () => Routes.COMPETITIONS,
  COMPETITIONS_TEAMS: () => Routes.COMPETITIONS_TEAMS,
  COMPETITIONS_TEAM: (teamId: string) =>
    Routes.COMPETITIONS_TEAM.replace(':teamId', teamId),
  COMPETITIONS_CREATE_TEAM: () => Routes.COMPETITIONS_CREATE_TEAM,
  COMPETITIONS_CREATE_TEAM_SOLO: () => Routes.COMPETITIONS_CREATE_TEAM_SOLO,
  COMPETITIONS_UPDATE_TEAM: (teamId: string) =>
    Routes.COMPETITIONS_UPDATE_TEAM.replace(':teamId', teamId),
  COMPETITIONS_GAME: (gameId: string) =>
    Routes.COMPETITIONS_GAME.replace(':gameId', gameId),
  FEES: () => Routes.FEES,
  REWARDS: () => Routes.REWARDS,
};
