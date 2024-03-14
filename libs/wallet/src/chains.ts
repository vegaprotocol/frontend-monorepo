export type Chain = {
  id: string;
  testnet: boolean;
  name: string;
};

export const mainnet = {
  id: 'vega-mainnet-0011',
  testnet: false,
  name: 'Fairground',
};

export const fairground = {
  id: 'vega-fairground-202305051805',
  testnet: true,
  name: 'Fairground',
};

export const stagnet = {
  id: 'vega-stagnet1-202307191148',
  testnet: true,
  name: 'Stagnet',
};

export const mockChain = {
  id: 'mock-chain',
  testnet: true,
  name: 'My Mocked Chain',
};
