import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ComponentProps } from 'react';
import { ETHERSCAN_ADDRESS, ETHERSCAN_TX, useEtherscanLink } from '../hooks';
import { useT } from '../use-t';

export const EtherscanLink = ({
  address,
  tx,
  children,
  ...props
}: {
  address?: string;
  tx?: string;
} & ComponentProps<typeof ExternalLink>) => {
  const t = useT();
  const etherscanLink = useEtherscanLink();
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
      title={t('View on Etherscan (opens in a new tab)')}
      {...props}
    >
      {children || address || tx}
    </ExternalLink>
  );
};
