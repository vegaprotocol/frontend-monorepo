import { useEnvironment } from '@vegaprotocol/environment';

// export const NODE_URL = 'https://api.stagnet1.vega.rocks/api/v2';
// export const NODE_URL = 'https://api.n00.testnet.vega.xyz/api/v2';
export const restApiUrl = () => {
  const apiNode = useEnvironment.getState().API_NODE;
  if (!apiNode) {
    throw new Error('API_NODE not configured');
  }
  return apiNode?.restApiUrl;
};

export const wsApiUrl = (apiUrl?: string) => {
  const node = new URL(apiUrl || restApiUrl());
  node.protocol = 'wss:';
  return node.toString();
};

export const CLI_WALLET_URL = 'http://localhost:1789';
export const EXPLORER_URL = 'https://explorer.stagnet1.vega.rocks';
export const CONSOLE_URL = 'https://trading.stagnet1.vega.rocks';
export const DOCS_URL = 'https://docs.vega.xyz';
export const DOCS_UPDATE_MARKET_TUTORIAL_URL = `${DOCS_URL}/mainnet/concepts/governance/market#propose-updates-to-a-market`;
