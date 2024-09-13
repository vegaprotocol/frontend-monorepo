export type Chain = {
  id: string;
  testnet: boolean;
  name: string;
};

export const nebula1 = {
  id: 'nebula1',
  testnet: false,
  name: 'Nebula',
};

export const mockChain = {
  id: 'mock-chain',
  testnet: true,
  name: 'My Mocked Chain',
};
