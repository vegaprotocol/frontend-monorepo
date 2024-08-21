import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { CopyWithCheckmark } from '@/components/copy-with-check';
import { ExternalLink } from '@/components/external-link';
import { ArbitrumLogo } from '@/components/icons/arbitrum';
import { useNetwork } from '@/contexts/network/network-context';

export const locators = {
  title: 'arbitrum-key-title',
  explorerLink: 'arbitrum-explorer-link',
};

const ArbIcon = () => {
  return (
    <div
      style={{
        height: 42,
        width: 42,
      }}
      className="flex items-center justify-center rounded-md overflow-hidden bg-vega-pink-650 p-1.5"
    >
      <ArbitrumLogo />
    </div>
  );
};

export const ArbitrumKey = ({ address }: { address: string }) => {
  const { network } = useNetwork();
  return (
    <div className="flex items-center">
      <ArbIcon />
      <div className="ml-4">
        <div
          data-testid={locators.title}
          className="text-left text-surface-0-fg"
        >
          Arbitrum Address
        </div>
        <ExternalLink
          className="text-vega-dark-400"
          data-testid={locators.explorerLink}
          href={`${network.arbitrumExplorerLink}/address/${address}`}
        >
          {truncateMiddle(address)}
        </ExternalLink>
        <CopyWithCheckmark text={address} />
      </div>
    </div>
  );
};
