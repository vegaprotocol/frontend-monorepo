export type EthereumChainId = '0x1' | '0x3' | '0x4' | '0x5' | '0x2a';
export type EthereumChainName =
  | 'Mainnet'
  | 'Ropsten'
  | 'Rinkeby'
  | 'Goerli'
  | 'Kovan';

export const EthereumChainNames: Record<EthereumChainId, EthereumChainName> = {
  '0x1': 'Mainnet',
  '0x3': 'Ropsten',
  '0x4': 'Rinkeby',
  '0x5': 'Goerli',
  '0x2a': 'Kovan',
};

export const EthereumChainIds: Record<EthereumChainName, EthereumChainId> = {
  Mainnet: '0x1',
  Ropsten: '0x3',
  Rinkeby: '0x4',
  Goerli: '0x5',
  Kovan: '0x2a',
};
