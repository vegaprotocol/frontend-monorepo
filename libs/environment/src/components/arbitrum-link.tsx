import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ComponentProps } from 'react';
import { getExternalChainLabel } from '../external-chain';
import { useArbitrumLink, ARBITRUM_ADDRESS, ARBITRUM_TX } from '../hooks';
import { useT } from '../use-t';

export const ArbitrumLink = ({
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
  const t = useT();
  const arbitrumLink = useArbitrumLink(sourceChainId);
  let href = '';

  if ((!address && !tx) || (address && tx)) {
    return null;
  }

  if (address) {
    href = arbitrumLink(ARBITRUM_ADDRESS.replace(':hash', address));
  }
  if (tx) {
    href = arbitrumLink(ARBITRUM_TX.replace(':hash', tx));
  }

  return (
    <ExternalLink
      href={href}
      title={
        sourceChainId
          ? t('View on {{chainLabel}} (opens in a new tab)', {
              chainLabel: getExternalChainLabel(sourceChainId.toString()),
            })
          : t('View on Etherscan (opens in a new tab)')
      }
      {...props}
    >
      {children || address || tx}
    </ExternalLink>
  );
};
