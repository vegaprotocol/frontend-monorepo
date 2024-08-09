// export const NODE_URL = 'https://api.stagnet1.vega.rocks/api/v2';
export const NODE_URL = 'https://api.n00.testnet.vega.xyz/api/v2';
export const CLI_WALLET_URL = 'http://localhost:1789';

export const EXPLORER_URL = 'https://explorer.stagnet1.vega.rocks';
export const CONSOLE_URL = 'https://trading.stagnet1.vega.rocks';
export const DOCS_URL = 'https://docs.vega.xyz';

export const DOCS_UPDATE_MARKET_TUTORIAL_URL = `${DOCS_URL}/mainnet/concepts/governance/market#propose-updates-to-a-market`;

export const wsUrl = (apiUrl?: string) => {
  const node = new URL(apiUrl || NODE_URL);
  node.protocol = 'wss:';
  return node.toString();
};
