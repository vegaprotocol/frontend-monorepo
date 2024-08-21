import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { CopyWithCheckmark } from '@/components/copy-with-check';
import { ArbitrumLogo } from '@/components/icons/arbitrum';
import { BlockExplorerLink } from '@vegaprotocol/environment';

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
      className="flex items-center justify-center rounded-md overflow-hidden bg-pink-650 p-1.5"
    >
      <ArbitrumLogo />
    </div>
  );
};

export const ArbitrumKey = ({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}) => {
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
        <BlockExplorerLink sourceChainId={chainId} address={address}>
          {truncateMiddle(address)}
        </BlockExplorerLink>
        <CopyWithCheckmark text={address} />
      </div>
    </div>
  );
};
