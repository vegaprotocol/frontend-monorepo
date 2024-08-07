import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { useNetwork } from '@/contexts/network/network-context';

import { ExternalLink } from '../external-link';

export const locators = {
  marketLink: 'market-link',
};

export const MarketLink = ({
  marketId,
  name,
}: {
  marketId: string;
  name?: string;
}) => {
  const { network } = useNetwork();
  return (
    <ExternalLink
      data-testid={locators.marketLink}
      href={`${network.explorer}/markets/${marketId}`}
    >
      {name ?? truncateMiddle(marketId)}
    </ExternalLink>
  );
};
