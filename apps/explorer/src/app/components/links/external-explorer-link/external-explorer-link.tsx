import Hash from '../hash';

export enum EthExplorerLinkTypes {
  block = 'block',
  address = 'address',
  tx = 'tx',
}

export type ExternalExplorerLinkProps = Partial<typeof HTMLAnchorElement> & {
  id: string;
  type: EthExplorerLinkTypes;
  chain?: string;
  code?: boolean;
};

export const ExternalExplorerLink = ({
  id,
  type,
  chain = '1',
  code = false,
  ...props
}: ExternalExplorerLinkProps) => {
  const link = `${getExternalExplorerLink(chain, type)}/${type}/${id}${
    code ? '#code' : ''
  }`;
  return (
    <a
      className="underline external font-mono"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      href={link}
    >
      <ExternalChainIcon chainId={chain} />
      <Hash text={id} />
    </a>
  );
};

export const SUPPORTED_CHAIN_IDS: string[] = ['1', '100', '42161', '11155111'];

type ChainIdMapping = {
  [K in typeof SUPPORTED_CHAIN_IDS[number]]: string;
};

export const SUPPORTED_CHAIN_LABELS: ChainIdMapping = {
  '1': 'Ethereum',
  '100': 'Gnosis',
  '42161': 'Arbitrum',
  '11155111': 'Sepolia',
};

export const SUPPORTED_CHAIN_ICON_URLS: ChainIdMapping = {
  '1': '/assets/chain-eth-logo.svg',
  '100': '/assets/chain-gno-logo.svg',
  '42161': '/assets/chain-arb-logo.svg',
  '11155111': '/assets/chain-eth-logo.svg',
};

export function getExternalExplorerLink(chainId: string, type: string) {
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

type ExternalChainIconProps = {
  chainId?: string;
};

export const ExternalChainIcon = ({
  chainId = '-1',
}: ExternalChainIconProps) => {
  if (SUPPORTED_CHAIN_IDS.includes(chainId)) {
    const url = SUPPORTED_CHAIN_ICON_URLS[chainId];
    const alt = SUPPORTED_CHAIN_LABELS[chainId];

    return (
      <img
        src={url}
        className="inline-block w-4 h-4 mr-1 dark:invert"
        alt={alt}
        title={alt}
      />
    );
  } else {
    return null;
  }
};
