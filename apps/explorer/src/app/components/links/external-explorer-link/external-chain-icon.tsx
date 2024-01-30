import type { ChainIdMapping } from './external-chain';
import { SUPPORTED_CHAIN_IDS, SUPPORTED_CHAIN_LABELS } from './external-chain';

export const SUPPORTED_CHAIN_ICON_URLS: ChainIdMapping = {
  '1': '/assets/chain-eth-logo.svg',
  '100': '/assets/chain-gno-logo.svg',
  '42161': '/assets/chain-arb-logo.svg',
  '11155111': '/assets/chain-eth-logo.svg',
};

export type ExternalChainIconProps = {
  chainId?: string;
};

export const ExternalChainIcon = ({
  // If chainID is not provided, default to a non-existent chain
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
