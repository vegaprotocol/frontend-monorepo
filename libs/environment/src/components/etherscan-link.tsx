import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ComponentProps } from 'react';
import { ETHERSCAN_ADDRESS, ETHERSCAN_TX, useEtherscanLink } from '../hooks';
import { useT } from '../use-t';
import { getExternalChainLabel } from '../external-chain';

export const EtherscanLink = ({
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
  const etherscanLink = useEtherscanLink(sourceChainId);
  let href = '';

  if ((!address && !tx) || (address && tx)) {
    return null;
  }

  if (address) {
    href = etherscanLink(ETHERSCAN_ADDRESS.replace(':hash', address));
  }
  if (tx) {
    href = etherscanLink(ETHERSCAN_TX.replace(':hash', tx));
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
