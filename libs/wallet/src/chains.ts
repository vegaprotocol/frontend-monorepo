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

export const mainnetMirror = {
  id: 'vega-mainnet-mirror-202306231148',
  testnet: false,
  name: 'Mainnet Mirror',
};
export const fairground = {
  id: 'vega-fairground-202305051805',
  testnet: true,
  name: 'Fairground',
};

export const validatorsTestnet = {
  id: 'vega-testnet-0002-v4',
  testnet: true,
  name: 'Validators Testnet',
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
