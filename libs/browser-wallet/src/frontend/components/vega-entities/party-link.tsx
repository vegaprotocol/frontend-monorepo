import { ExternalLink, truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';

import { useNetwork } from '@/contexts/network/network-context';

export const locators = {
  partyLink: 'party-link',
};

export const PartyLink = ({
  publicKey,
  text,
}: {
  publicKey: string;
  text?: string;
}) => {
  const { network } = useNetwork();

  return (
    <ExternalLink
      className={cn('text-vega-dark-400', { 'font-mono': !text })}
      data-testid={locators.partyLink}
      href={`${network.explorer}/parties/${publicKey}`}
    >
      {text ?? truncateMiddle(publicKey)}
    </ExternalLink>
  );
};
