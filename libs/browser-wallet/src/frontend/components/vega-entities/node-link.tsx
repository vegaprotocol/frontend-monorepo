import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { ExternalLink } from '@/components/external-link';
import { useNetwork } from '@/contexts/network/network-context';

export const locators = {
  nodeLink: 'node-link',
};

export const NodeLink = ({
  nodeId,
  name,
}: {
  nodeId: string;
  name?: string;
}) => {
  const { network } = useNetwork();
  return (
    <ExternalLink
      data-testid={locators.nodeLink}
      href={`${network.governance}/validators/${nodeId}`}
    >
      {name ?? truncateMiddle(nodeId)}
    </ExternalLink>
  );
};
