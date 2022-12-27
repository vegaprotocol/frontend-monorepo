/** createDocsLinks returns external documentation links that are specific to an environment
 * @param {string} docsUrl - the documentation URL for the environment ex. https://docs.vega.xyz/testnet or https://docs.vega.xyz/mainnet (NX_VEGA_DOCS_URL)
 */

export const createDocsLinks = (docsUrl: string) => ({
  AUCTION_TYPE_OPENING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-opening`,
  AUCTION_TYPE_LIQUIDITY_MONITORING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring`,
  AUCTION_TYPE_PRICE_MONITORING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-price-monitoring`,
  AUCTION_TYPE_CLOSING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-closing`,
  STAKING_GUIDE: `${docsUrl}/concepts/vega-chain/#staking-on-vega`,
  VEGA_WALLET_CONCEPTS_URL: `${docsUrl}/concepts/vega-wallet`,
  PROPOSALS_GUIDE: `${docsUrl}/tutorials/proposals`,
  NODE_OPERATORS: `${docsUrl}/node-operators`,
});

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

export const TokenLinks = {
  PROPOSAL_PAGE: ':tokenUrl/proposals/:proposalId',
  UPDATE_PROPOSAL_PAGE: ':tokenUrl/proposals/propose/update-market',
};
