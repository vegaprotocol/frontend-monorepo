import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { useNetwork } from '@/contexts/network/network-context';

import { CopyWithCheckmark } from '../../copy-with-check';
import { ExternalLink } from '../../external-link';
import { EthereumIcon } from '../../icons/ethereum-icon';

export const locators = {
  title: 'ethereum-key-title',
  explorerLink: 'ethereum-explorer-link',
};

const EthIcon = () => {
  return (
    <div
      style={{
        height: 42,
        width: 42,
      }}
      className="flex items-center justify-center rounded-md overflow-hidden bg-vega-blue-650"
    >
      <EthereumIcon />
    </div>
  );
};

export const EthereumKey = ({ address }: { address: string }) => {
  const { network } = useNetwork();
  return (
    <div className="flex items-center">
      <EthIcon />
      <div className="ml-4">
        <div
          data-testid={locators.title}
          className="text-left text-surface-0-fg"
        >
          Ethereum Address
        </div>
        <ExternalLink
          className="text-vega-dark-400"
          data-testid={locators.explorerLink}
          href={`${network.ethereumExplorerLink}/address/${address}`}
        >
          {truncateMiddle(address)}
        </ExternalLink>
        <CopyWithCheckmark text={address} />
      </div>
    </div>
  );
};
