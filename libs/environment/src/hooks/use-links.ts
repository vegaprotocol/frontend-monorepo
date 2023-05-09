import trim from 'lodash/trim';
import { useCallback } from 'react';
import { Networks } from '../types';
import { useEnvironment } from './use-environment';
import { stripFullStops } from '@vegaprotocol/utils';

type Net = Exclude<Networks, 'CUSTOM'>;
export enum DApp {
  Explorer = 'Explorer',
  Console = 'Console',
  Token = 'Token',
}

type DAppLinks = {
  [k in Net]: string;
};

const EmptyLinks: DAppLinks = {
  [Networks.VALIDATOR_TESTNET]: '',
  [Networks.DEVNET]: '',
  [Networks.STAGNET1]: '',
  [Networks.TESTNET]: '',
  [Networks.MAINNET]: '',
};

const ExplorerLinks = {
  ...EmptyLinks,
  [Networks.TESTNET]: 'https://explorer.fairground.wtf',
  [Networks.VALIDATOR_TESTNET]: 'https://validator-testnet.explorer.vega.xyz',
  [Networks.MAINNET]: 'https://explorer.vega.xyz',
};

const ConsoleLinks = {
  ...EmptyLinks,
  [Networks.STAGNET1]: 'https://stagnet1.console.vega.xyz',
  [Networks.TESTNET]: 'https://console.fairground.wtf',
};

const TokenLinks = {
  ...EmptyLinks,
  [Networks.DEVNET]: 'https://dev.governance.vega.xyz',
  [Networks.TESTNET]: 'https://governance.fairground.wtf',
  [Networks.VALIDATOR_TESTNET]: 'https://validator-testnet.governance.vega.xyz',
  [Networks.MAINNET]: 'https://governance.vega.xyz',
};

const Links: { [k in DApp]: DAppLinks } = {
  [DApp.Explorer]: ExplorerLinks,
  [DApp.Console]: ConsoleLinks,
  [DApp.Token]: TokenLinks,
};

export const useLinks = (dapp: DApp, network?: Net) => {
  const { VEGA_ENV, VEGA_EXPLORER_URL, VEGA_TOKEN_URL } = useEnvironment();
  const fallback = {
    [DApp.Explorer]: VEGA_EXPLORER_URL,
    [DApp.Token]: VEGA_TOKEN_URL,
  };

  let net = network || VEGA_ENV;
  if (net === Networks.CUSTOM) {
    net = Networks.TESTNET;
  }

  let baseUrl = trim(Links[dapp][net], '/');
  if (baseUrl.length === 0 && Object.keys(fallback).includes(dapp)) {
    baseUrl = trim(fallback[dapp as DApp.Explorer | DApp.Token] || '', '/');
  }

  const link = useCallback(
    (url?: string) => `${baseUrl}/${trim(url, '/') || ''}`,
    [baseUrl]
  );
  return link;
};

export const useEtherscanLink = () => {
  const { ETHERSCAN_URL } = useEnvironment();
  const baseUrl = trim(ETHERSCAN_URL, '/');
  const link = useCallback(
    (url?: string) => `${baseUrl}/${trim(url, '/') || ''}`,
    [baseUrl]
  );
  return link;
};

/** useDocsLink returns external documentation links that are specific to an environment
 *  ex. https://docs.vega.xyz/testnet or https://docs.vega.xyz/mainnet (based on NX_VEGA_DOCS_URL)
 * @param {string} path - the documentation path
 */
export const useDocsLink = () => {
  const { VEGA_DOCS_URL } = useEnvironment();
  const baseUrl = trim(VEGA_DOCS_URL, '/');
  const link = useCallback(
    (url?: string) => `${baseUrl}/${trim(url, '/') || ''}`,
    [baseUrl]
  );
  return link;
};

// Vega blog
export const BLOG = 'https://blog.vega.xyz/';

// Governance pages
export const TOKEN_NEW_MARKET_PROPOSAL = '/proposals/propose/new-market';
export const TOKEN_NEW_NETWORK_PARAM_PROPOSAL =
  '/proposals/propose/network-parameter';
export const TOKEN_GOVERNANCE = '/proposals';
export const TOKEN_PROPOSALS = '/proposals';
export const TOKEN_PROPOSAL = '/proposals/:id';
export const TOKEN_PROTOCOL_UPGRADE_PROPOSAL =
  '/proposals/protocol-upgrade/:tag';
export const TOKEN_VALIDATOR = '/validators/:id';
export const PROPOSAL_PAGE = ':tokenUrl/proposals/:proposalId';
export const UPDATE_PROPOSAL_PAGE = ':tokenUrl/proposals/propose/update-market';

/**
 * Generates link to the protocol upgrade proposal details on Governance
 */
export const useProtocolUpgradeProposalLink = () => {
  const governance = useLinks(DApp.Token);
  return (releaseTag: string) =>
    governance(
      TOKEN_PROTOCOL_UPGRADE_PROPOSAL.replace(
        ':tag',
        stripFullStops(releaseTag)
      )
    );
};

// Explorer pages
export const EXPLORER_TX = '/txs/:hash';
export const EXPLORER_ORACLE = '/oracles/:id';

// Etherscan pages
export const ETHERSCAN_ADDRESS = '/address/:hash';
export const ETHERSCAN_TX = '/tx/:hash';

// Console pages
export const CONSOLE_MARKET = '/markets/:marketId';
export const CONSOLE_MARKETS = '/markets/all';
export const CONSOLE_PORTFOLIO = '/portfolio';
export const CONSOLE_LIQUIDITY = 'liquidity/:marketId';

// Vega XYZ
export const GET_VEGA_WALLET_URL = 'https://vega.xyz/wallet/';

// Docs
export const DOCS_VEGA_WALLET = '/tools/vega-wallet';

// Vega Docs
export const DOCS = {
  NEW_TO_VEGA: `/concepts/new-to-vega`,
  AUCTION_TYPE_OPENING: `/concepts/trading-on-vega/trading-modes#auction-type-opening`,
  AUCTION_TYPE_LIQUIDITY_MONITORING: `/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring`,
  AUCTION_TYPE_PRICE_MONITORING: `/concepts/trading-on-vega/trading-modes#auction-type-price-monitoring`,
  AUCTION_TYPE_CLOSING: `/concepts/trading-on-vega/trading-modes#auction-type-closing`,
  STAKING_GUIDE: `/concepts/vega-chain/#staking-on-vega`,
  REWARDS_GUIDE: `/concepts/trading-on-vega/fees-rewards#trading-rewards`,
  VEGA_WALLET_CONCEPTS_URL: `/concepts/vega-wallet`,
  PROPOSALS_GUIDE: `/tutorials/proposals`,
  NODE_OPERATORS: `/node-operators`,
  LOSS_SOCIALIZATION: `/concepts/trading-on-vega/market-protections#loss-socialisation`,
  POSITION_RESOLUTION: `/concepts/trading-on-vega/market-protections#position-resolution`,
  LIQUIDITY: `/concepts/liquidity/provision`,
  WITHDRAWAL_LIMIT: `/testnet/concepts/deposits-withdrawals#withdrawal-limit`,
  VEGA_WALLET: `/tools/vega-wallet`,
};

// External links
export const ExternalLinks = {
  FEEDBACK: 'https://github.com/vegaprotocol/feedback/discussions',
  GITHUB: 'https://github.com/vegaprotocol/token-frontend',
  DISCORD: 'https://vega.xyz/discord',
  GOVERNANCE_PAGE: 'https://vega.xyz/governance',
  VALIDATOR_FORUM: 'https://community.vega.xyz/c/mainnet-validator-candidates',
  MARGIN_CREDIT_RISK:
    'https://vega.xyz/papers/margins-and-credit-risk.pdf#page=7',
  VEGA_WALLET_URL: 'https://vega.xyz/wallet',
  VEGA_WALLET_HOSTED_URL: 'https://vega-hosted-wallet.on.fleek.co/',
};
