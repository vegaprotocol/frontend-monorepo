import trim from 'lodash/trim';
import { useCallback } from 'react';
import { Networks } from '../types';
import { ENV, useEnvironment } from './use-environment';
import { stripFullStops } from '@vegaprotocol/utils';

const VEGA_DOCS_URL =
  process.env['NX_VEGA_DOCS_URL'] || 'https://docs.vega.xyz/mainnet';

type Net = Exclude<Networks, 'CUSTOM'>;
export enum DApp {
  Explorer = 'Explorer',
  Console = 'Console',
  Governance = 'Governance',
}

type DAppLinks = {
  [k in Net]: string;
};

const EmptyLinks: DAppLinks = {
  [Networks.VALIDATOR_TESTNET]: '',
  [Networks.MAINNET_MIRROR]: '',
  [Networks.DEVNET]: '',
  [Networks.STAGNET1]: '',
  [Networks.TESTNET]: '',
  [Networks.MAINNET]: '',
};

const ExplorerLinks = {
  ...EmptyLinks,
  [Networks.STAGNET1]: 'https://explorer.stagnet1.vega.rocks',
  [Networks.TESTNET]: 'https://explorer.fairground.wtf',
  [Networks.VALIDATOR_TESTNET]:
    'https://explorer.validators-testnet.vega.rocks',
  [Networks.MAINNET_MIRROR]: 'https://explorer.mainnet-mirror.vega.rocks/',
  [Networks.MAINNET]: 'https://explorer.vega.xyz',
};

const ConsoleLinks = {
  ...EmptyLinks,
  [Networks.STAGNET1]: 'https://trading.stagnet1.vega.rocks',
  [Networks.TESTNET]: 'https://console.fairground.wtf',
  [Networks.MAINNET]: 'https://vega.trading',
  [Networks.MAINNET_MIRROR]: 'https://console.mainnet-mirror.vega.rocks',
};

const GovernanceLinks = {
  ...EmptyLinks,
  [Networks.DEVNET]: 'https://dev.governance.vega.xyz',
  [Networks.STAGNET1]: 'https://governance.stagnet1.vega.rocks',
  [Networks.TESTNET]: 'https://governance.fairground.wtf',
  [Networks.VALIDATOR_TESTNET]:
    'https://governance.validators-testnet.vega.rocks',
  [Networks.MAINNET_MIRROR]: 'https://governance.mainnet-mirror.vega.rocks',
  [Networks.MAINNET]: 'https://governance.vega.xyz',
};

const Links: { [k in DApp]: DAppLinks } = {
  [DApp.Explorer]: ExplorerLinks,
  [DApp.Console]: ConsoleLinks,
  [DApp.Governance]: GovernanceLinks,
};

export const DocsLinks = VEGA_DOCS_URL
  ? {
      NEW_TO_VEGA: `${VEGA_DOCS_URL}/concepts/new-to-vega`,
      AUCTION_TYPE_OPENING: `${VEGA_DOCS_URL}/concepts/trading-on-vega/trading-modes#auction-type-opening`,
      AUCTION_TYPE_LIQUIDITY_MONITORING: `${VEGA_DOCS_URL}/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring`,
      AUCTION_TYPE_PRICE_MONITORING: `${VEGA_DOCS_URL}/concepts/trading-on-vega/trading-modes#auction-type-price-monitoring`,
      AUCTION_TYPE_CLOSING: `${VEGA_DOCS_URL}/concepts/trading-on-vega/trading-modes#auction-type-closing`,
      STAKING_GUIDE: `${VEGA_DOCS_URL}/concepts/vega-chain/#staking-on-vega`,
      REWARDS_GUIDE: `${VEGA_DOCS_URL}/concepts/trading-on-vega/fees-rewards#trading-rewards`,
      VEGA_WALLET_CONCEPTS_URL: `${VEGA_DOCS_URL}/concepts/vega-wallet`,
      VEGA_WALLET_TOOLS_URL: `${VEGA_DOCS_URL}/tools/vega-wallet`,
      PROPOSALS_GUIDE: `${VEGA_DOCS_URL}/tutorials/proposals`,
      NODE_OPERATORS: `${VEGA_DOCS_URL}/node-operators`,
      LOSS_SOCIALIZATION: `${VEGA_DOCS_URL}/concepts/trading-on-vega/market-protections#loss-socialisation`,
      POSITION_RESOLUTION: `${VEGA_DOCS_URL}/concepts/trading-on-vega/market-protections#position-resolution`,
      LIQUIDITY: `${VEGA_DOCS_URL}/concepts/liquidity/provision`,
      WITHDRAWAL_LIMITS: `${VEGA_DOCS_URL}/concepts/assets/deposits-withdrawals#withdrawal-limits`,
      VALIDATOR_SCORES_REWARDS: `${VEGA_DOCS_URL}/concepts/vega-chain/validator-scores-and-rewards`,
      MARKET_LIFECYCLE: `${VEGA_DOCS_URL}/concepts/trading-on-vega/market-lifecycle`,
    }
  : undefined;

export const useLinks = (dapp: DApp, network?: Net) => {
  const { VEGA_ENV, VEGA_EXPLORER_URL, VEGA_TOKEN_URL, VEGA_CONSOLE_URL } = ENV;
  const fallback = {
    [DApp.Explorer]: VEGA_EXPLORER_URL,
    [DApp.Governance]: VEGA_TOKEN_URL,
    [DApp.Console]: VEGA_CONSOLE_URL,
  };

  let net = network || VEGA_ENV;
  if (net === Networks.CUSTOM) {
    net = Networks.TESTNET;
  }

  let baseUrl = trim(Links[dapp][net], '/');
  if (baseUrl.length === 0 && Object.keys(fallback).includes(dapp)) {
    baseUrl = trim(
      fallback[dapp as DApp.Explorer | DApp.Governance] || '',
      '/'
    );
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

// Governance pages
export const TOKEN_NEW_MARKET_PROPOSAL = '/proposals/propose/new-market';
export const TOKEN_NEW_NETWORK_PARAM_PROPOSAL =
  '/proposals/propose/network-parameter';
export const TOKEN_GOVERNANCE = '/proposals';
export const TOKEN_PROPOSALS = '/proposals';
export const TOKEN_PROPOSAL = '/proposals/:id';
export const TOKEN_PROTOCOL_UPGRADE_PROPOSAL =
  '/proposals/protocol-upgrade/:tag/:blockHeight';
export const TOKEN_VALIDATOR = '/validators/:id';

/**
 * Generates link to the protocol upgrade proposal details on Governance
 */
export const useProtocolUpgradeProposalLink = () => {
  const governance = useLinks(DApp.Governance);
  return (releaseTag: string, blockHeight: string) =>
    governance(
      TOKEN_PROTOCOL_UPGRADE_PROPOSAL.replace(
        ':tag',
        stripFullStops(releaseTag)
      ).replace(':blockHeight', blockHeight)
    );
};

// Explorer pages
export const EXPLORER_TX = '/txs/:hash';
export const EXPLORER_ORACLE = '/oracles/:id';
export const EXPLORER_MARKET = '/markets/:id';

// Etherscan pages
export const ETHERSCAN_ADDRESS = '/address/:hash';
export const ETHERSCAN_TX = '/tx/:hash';

export const ExternalLinks = {
  FEEDBACK: 'https://github.com/vegaprotocol/feedback/discussions',
  GITHUB: 'https://github.com/vegaprotocol/token-frontend',
  DISCORD: 'https://vega.xyz/discord',
  GOVERNANCE_PAGE: 'https://vega.xyz/governance',
  VALIDATOR_FORUM: 'https://community.vega.xyz/c/mainnet-validator-candidates',
  PROPOSALS_FORUM: 'https://community.vega.xyz/c/governance/25',
  MARGIN_CREDIT_RISK:
    'https://vega.xyz/papers/margins-and-credit-risk.pdf#page=7',
  VEGA_WALLET_URL: 'https://vega.xyz/wallet',
  VEGA_WALLET_URL_ABOUT: 'https://vega.xyz/wallet/#overview',
  VEGA_WALLET_HOSTED_URL: 'https://vega-hosted-wallet.on.fleek.co/',
  VEGA_WALLET_BROWSER_LIST: '',
  BLOG: 'https://blog.vega.xyz/',
};

export const TokenStaticLinks = {
  PROPOSAL_PAGE: ':tokenUrl/proposals/:proposalId',
  UPDATE_PROPOSAL_PAGE: ':tokenUrl/proposals/propose/update-market',
  ASSOCIATE: 'token/associate',
};
