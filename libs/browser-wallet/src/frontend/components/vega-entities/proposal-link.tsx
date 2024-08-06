import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { ExternalLink } from '@/components/external-link';
import { useNetwork } from '@/contexts/network/network-context';

export const locators = {
  proposalLink: 'proposal-link',
};

export const ProposalLink = ({
  proposalId,
  name,
}: {
  proposalId: string;
  name?: string;
}) => {
  const { network } = useNetwork();
  return (
    <ExternalLink
      data-testid={locators.proposalLink}
      href={`${network.governance}/proposals/${proposalId}`}
    >
      {name ?? truncateMiddle(proposalId)}
    </ExternalLink>
  );
};
