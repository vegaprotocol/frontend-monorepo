export type ChainIdMapping = {
  [K in typeof SUPPORTED_CHAIN_IDS[number]]: string;
};
export const SUPPORTED_CHAIN_IDS: string[] = ['1', '100', '42161', '11155111'];

export const SUPPORTED_CHAIN_LABELS: ChainIdMapping = {
  '1': 'Ethereum',
  '100': 'Gnosis',
  '42161': 'Arbitrum',
  '11155111': 'Sepolia',
};

export function getExternalExplorerLink(chainId: string) {
  if (SUPPORTED_CHAIN_IDS.includes(chainId)) {
    switch (chainId) {
      case '1':
        return 'https://etherscan.io';
      case '100':
        return 'https://gnosisscan.io';
      case '42161':
        return 'https://arbiscan.io';
      case '11155111':
        return 'https://sepolia.etherscan.io';
      default:
        return '#';
    }
  } else {
    return '#';
  }
}

export function getExternalChainLabel(chainId?: string) {
  if (chainId && SUPPORTED_CHAIN_IDS.includes(chainId)) {
    return SUPPORTED_CHAIN_LABELS[chainId];
  } else {
    return 'Custom Chain';
  }
}
