/** ExternalLinks returns external documentation links that are specific to an environment
 * @param {string} docsUrl - the documentation URL for the environment ex. https://docs.vega.xyz/testnet or https://docs.vega.xyz (NX_VEGA_DOCS_URL)
 */

export const DocsLinks = (docsUrl = 'https://docs.vega.xyz/testnet') => ({
  AUCTION_TYPE_OPENING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-opening`,
  AUCTION_TYPE_LIQUIDITY_MONITORING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring`,
  AUCTION_TYPE_PRICE_MONITORING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-price-monitoring`,
  AUCTION_TYPE_CLOSING: `${docsUrl}/concepts/trading-on-vega/trading-modes#auction-type-closing`,
});
