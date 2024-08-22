import get from 'lodash/get';
import trim from 'lodash/trim';

import { useAsset } from '@/hooks/use-asset';
import { ExternalLink, truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { useCallback, type ComponentProps } from 'react';
import { useNetwork } from '@/contexts/network/network-context';

export const ETHERSCAN_ADDRESS = '/address/:hash';
export const ETHERSCAN_TX = '/tx/:hash';

export type ChainIdMapping = {
  [K in typeof SUPPORTED_CHAIN_IDS[number]]: string;
};
export const SUPPORTED_CHAIN_IDS: string[] = [
  '1',
  '100',
  '42161',
  '421614',
  '11155111',
];

export const SUPPORTED_CHAIN_LABELS: ChainIdMapping = {
  '1': 'Ethereum',
  '100': 'Gnosis',
  '42161': 'Arbitrum',
  '421614': 'Arbitrum (Sepolia)',
  '11155111': 'Ethereum (Sepolia)',
};

export const SUPPORTED_CHAIN_SHORT_LABELS: ChainIdMapping = {
  '1': 'Eth',
  '100': 'Gno',
  '42161': 'Arb',
  '421614': 'Arb Sepolia',
  '11155111': 'Eth Sepolia',
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
      case '421614':
        return 'https://sepolia.arbiscan.io';
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

export function getExternalChainShortLabel(chainId?: string) {
  if (chainId && SUPPORTED_CHAIN_IDS.includes(chainId)) {
    return SUPPORTED_CHAIN_SHORT_LABELS[chainId];
  } else {
    return chainId;
  }
}

export const useExternalExplorerLink = (sourceChainId?: number) => {
  const { etherscanUrl } = useNetwork();

  const otherScanUrl = sourceChainId
    ? getExternalExplorerLink(sourceChainId.toString())
    : undefined;

  const baseUrl = trim(otherScanUrl || etherscanUrl, '/');

  const link = useCallback(
    (url?: string) => `${baseUrl}/${trim(url, '/') || ''}`,
    [baseUrl]
  );
  return link;
};

/** BlockExplorerLink (external) directs to any external block explorer links (e.g. etherscan.io or arbiscan.io)  */
export const BlockExplorerLink = ({
  address,
  tx,
  sourceChainId,
  children,
  ...props
}: {
  address?: string;
  tx?: string;
  sourceChainId?: number;
} & ComponentProps<typeof ExternalLink>) => {
  const externalLink = useExternalExplorerLink(sourceChainId);
  let href = '';

  if ((!address && !tx) || (address && tx)) {
    return null;
  }

  if (address) {
    href = externalLink(ETHERSCAN_ADDRESS.replace(':hash', address));
  }
  if (tx) {
    href = externalLink(ETHERSCAN_TX.replace(':hash', tx));
  }

  return (
    <ExternalLink
      href={href}
      title={
        sourceChainId
          ? `View on ${getExternalChainLabel(
              sourceChainId.toString()
            )} (opens in a new tab)`
          : 'View on Etherscan (opens in a new tab)'
      }
      {...props}
    >
      {children || address || tx}
    </ExternalLink>
  );
};

export const ReceivingKey = ({
  assetId,
  address,
}: {
  address: string;
  assetId: string;
}) => {
  const asset = useAsset(assetId);
  const chainId = get(asset, 'details.erc20.chainId');
  if (!chainId) return null;
  return (
    <BlockExplorerLink sourceChainId={chainId} address={address}>
      {truncateMiddle(address)}
    </BlockExplorerLink>
  );
};
