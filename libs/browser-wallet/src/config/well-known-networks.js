const mockPort = 9090;

export const fairground = {
  color: '#D7FB50',
  secondaryColor: '#000000',
  id: 'fairground',
  name: 'Fairground',
  chainId: 'vega-fairground-202305051805',
  hidden: false,
  rest: [
    'https://api.n00.testnet.vega.rocks',
    'https://api.n06.testnet.vega.rocks',
    'https://api.n07.testnet.vega.rocks',
    'https://api.n08.testnet.vega.rocks',
    'https://api.n09.testnet.vega.rocks',
  ],

  ethereumExplorerLink: 'https://sepolia.etherscan.io',
  ethereumChainId: '11155111',
  arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
  arbitrumChainId: '421614',

  console: 'https://console.fairground.wtf',
  explorer: 'https://explorer.fairground.wtf',
  governance: 'https://governance.fairground.wtf',

  docs: 'https://docs.vega.xyz/testnet/concepts/new-to-vega',
  vegaDapps: 'https://vega.xyz/apps',
};

export const testingNetwork = {
  ...fairground,
  id: 'test',
  etherscanUrl: 'https://sepolia.etherscan.io',
  name: 'Test',
  chainId: 'test-chain-id',
  rest: [`http://localhost:${mockPort}`],
};

export const testingNetwork2 = {
  ...testingNetwork,
  explorer: 'https://different-explorer.vega.xyz',
  id: 'test2',
  name: 'Test 2',
  chainId: 'test-chain-id-2',
};
