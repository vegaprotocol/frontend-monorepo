/** ExternalLinks returns external documentation links that are specific to an environment
 * @param {string} docsUrl - the documentation URL for the environment ex. https://docs.vega.xyz/testnet or https://docs.vega.xyz (NX_VEGA_DOCS_URL)
 */

export const DocsLinks = (docsUrl = 'https://docs.vega.xyz/testnet') => ({
  AUCTION_TYPE_OPENING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-opening`,
  AUCTION_TYPE_LIQUIDITY_MONITORING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring`,
  AUCTION_TYPE_PRICE_MONITORING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-price-monitoring`,
  AUCTION_TYPE_CLOSING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-closing`,
});

export const ExternalLinks = {
  SUSHI_PAIRS: 'https://analytics.sushi.com/pairs/',
  SUSHI_ONSEN_MENU: 'https://app.sushi.com/farm',
  SUSHI_ONSEN_WHAT_IS:
    'https://docs.sushi.com/products/yield-farming/what-is-onsen',
  SUSHI_ONSEN_FAQ: 'https://docs.sushi.com/faq-1/onsen-faq',
  FEEDBACK: 'https://github.com/vegaprotocol/feedback/discussions',
  GITHUB: 'https://github.com/vegaprotocol/token-frontend',
  DISCORD: 'https://vega.xyz/discord',
  STAKING_GUIDE:
    'https://docs.vega.xyz/docs/mainnet/concepts/vega-chain/#staking-on-vega',
  GOVERNANCE_PAGE: 'https://vega.xyz/governance',
  PROPOSALS_GUIDE: 'https://docs.vega.xyz/docs/mainnet/tutorials/proposals',
  VALIDATOR_FORUM: 'https://community.vega.xyz/c/mainnet-validator-candidates',
  MARGIN_CREDIT_RISK:
    'https://vega.xyz/papers/margins-and-credit-risk.pdf#page=7',
  VEGA_WALLET_URL: 'https://vega.xyz/wallet',
  VEGA_WALLET_CONCEPTS_URL:
    'https://docs.vega.xyz/docs/mainnet/concepts/vega-wallet',
  VEGA_WALLET_HOSTED_URL: 'https://vega-hosted-wallet.on.fleek.co/',
};
