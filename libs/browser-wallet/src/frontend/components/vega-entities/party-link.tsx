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
  const { explorer } = useNetwork();

  return (
    <ExternalLink
      className={cn('text-surface-0-fg-muted', { 'font-mono': !text })}
      data-testid={locators.partyLink}
      href={`${explorer}/parties/${publicKey}`}
    >
      {text ?? truncateMiddle(publicKey)}
    </ExternalLink>
  );
};
