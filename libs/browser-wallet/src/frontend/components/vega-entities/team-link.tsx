import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

import { useNetwork } from '@/contexts/network/network-context';

import { ExternalLink } from '../external-link';

export const locators = {
  teamLink: 'team-link',
};

export const TeamLink = ({
  children,
  id,
}: {
  children?: ReactNode;
  id: string;
}) => {
  const { network } = useNetwork();
  return (
    <ExternalLink
      data-testid={locators.teamLink}
      className="font-mono"
      href={`${network.console}/#/competitions/teams/${id}`}
    >
      {children ?? truncateMiddle(id)}
    </ExternalLink>
  );
};
