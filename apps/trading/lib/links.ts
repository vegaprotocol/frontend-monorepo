import trimEnd from 'lodash/trimEnd';

// Make all route paths 'absolute' for easier
// href creation
export const Routes = {
  HOME: '/',
  MARKETS: '/markets/all',
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
  TEAMS: '/teams',
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
  TEAMS: () => Routes.TEAMS,
};
