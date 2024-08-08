const mockPort = 9090;

export const mainnet = {
  color: '#000000',
  secondaryColor: '#FFFFFF',
  id: 'mainnet',
  name: 'Mainnet',
  chainId: 'vega-mainnet-0011',
  hidden: false,
  rest: [
    'https://vega-mainnet-data.commodum.io',
    'https://vega-data.nodes.guru:3008',
    'https://vega-data.bharvest.io',
    'https://datanode.vega.pathrocknetwork.org',
    'https://vega.aurora-edge.com',
    'https://darling.network',
    'https://rest.velvet.tm.p2p.org',
    'https://vega-rest.mainnet.lovali.xyz',
    'https://graphqlvega.gpvalidator.com',
    'https://vega-mainnet.anyvalid.com',
    'https://vega.mainnet.stakingcabin.com:3008',
  ],

  ethereumExplorerLink: 'https://etherscan.io',
  ethereumChainId: 1,
  arbitrumExplorerLink: 'https://arbiscan.io',
  arbitrumChainId: 42161,

  console: 'https://console.vega.xyz',
  explorer: 'https://explorer.vega.xyz',
  governance: 'https://governance.vega.xyz',

  docs: 'https://docs.vega.xyz/mainnet/concepts/new-to-vega',
  vegaDapps: 'https://vega.xyz/apps',
};

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

export const devnet = {
  color: '#00F780',
  secondaryColor: '#FFFFFF',
  id: 'devnet',
  name: 'Devnet',
  chainId: 'vega-devnet1-202401251038',
  hidden: true,
  rest: [
    'https://api.devnet1.vega.rocks',
    'https://api.n06.devnet1.vega.rocks',
    'https://api.n07.devnet1.vega.rocks',
  ],

  ethereumExplorerLink: 'https://sepolia.etherscan.io',
  ethereumChainId: '11155111',
  arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
  arbitrumChainId: '421614',

  console: '',
  explorer: '',
  governance: '',

  docs: 'https://docs.vega.xyz/testnet',
  vegaDapps: 'https://vega.xyz/apps',
};

export const stagnet1 = {
  color: '#0075FF',
  secondaryColor: '#FFFFFF',
  id: 'stagnet1',
  name: 'Stagnet 1',
  chainId: 'vega-stagnet1-202307191148',
  hidden: true,
  rest: [
    'https://api.stagnet1.vega.rocks',
    'https://api.n05.stagnet1.vega.rocks',
    'https://api.n06.stagnet1.vega.rocks',
  ],

  ethereumExplorerLink: 'https://sepolia.etherscan.io',
  ethereumChainId: '11155111',
  arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
  arbitrumChainId: '421614',

  console: 'https://console.stagnet1.vega.rocks',
  explorer: 'https://explorer.stagnet1.vega.rocks',
  governance: 'https://governance.stagnet1.vega.rocks',

  docs: 'https://docs.vega.xyz/testnet',
  vegaDapps: 'https://vega.xyz/apps',
};

export const mirror = {
  color: '#FF077F',
  secondaryColor: '#FFFFFF',
  id: 'mainnet-mirror',
  name: 'Mainnet Mirror',
  chainId: 'vega-mainnet-mirror-202306231148',
  hidden: true,
  rest: [
    'https://api.mainnet-mirror.vega.rocks',
    'https://api.n06.mainnet-mirror.vega.rocks',
  ],

  ethereumExplorerLink: 'https://sepolia.etherscan.io',
  ethereumChainId: '11155111',
  arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
  arbitrumChainId: '421614',

  console: 'https://console.mainnet-mirror.vega.rocks',
  explorer: 'https://explorer.mainnet-mirror.vega.rocks',
  governance: 'https://governance.mainnet-mirror.vega.rocks',

  docs: 'https://docs.vega.xyz/testnet',
  vegaDapps: 'https://vega.xyz/apps',
};

export const validatorTestnet = {
  color: '#8028FF',
  secondaryColor: '#FFFFFF',
  id: 'validator-testnet',
  name: 'Validator Testnet',
  chainId: 'vega-testnet-0002-v4',
  hidden: true,
  rest: [
    'https://rest.venom.tm.p2p.org',
    'https://vega-testnet.anyvalid.com',
    'https://testnet.vega.xprv.io/datanode',
    'https://vega-testnet.nodes.guru:3008',
    'https://testnet.vega.greenfield.xyz',
    'https://vega-testnet-data.commodum.io',
    'https://vega-rest.testnet.lovali.xyz',
    'https://vega-test-data.bharvest.io:3009',
  ],

  ethereumExplorerLink: 'https://sepolia.etherscan.io',
  ethereumChainId: '11155111',
  arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
  arbitrumChainId: '421614',

  console: 'https://console..validator-testnet.vega.rocks',
  explorer: 'https://explorer..validator-testnet.vega.rocks',
  governance: 'https://governance..validator-testnet.vega.rocks',

  docs: 'https://docs.vega.xyz/testnet',
  vegaDapps: 'https://vega.xyz/apps',
};

export const testingNetwork = {
  ...fairground,
  id: 'test',
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
