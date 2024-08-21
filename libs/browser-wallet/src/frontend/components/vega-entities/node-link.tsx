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
  const { governance } = useNetwork();
  return (
    <ExternalLink
      data-testid={locators.nodeLink}
      href={`${governance}/validators/${nodeId}`}
    >
      {name ?? truncateMiddle(nodeId)}
    </ExternalLink>
  );
};
