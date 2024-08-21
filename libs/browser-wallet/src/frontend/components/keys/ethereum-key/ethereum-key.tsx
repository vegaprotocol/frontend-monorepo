import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { CopyWithCheckmark } from '../../copy-with-check';
import { EthereumIcon } from '../../icons/ethereum-icon';
import { BlockExplorerLink } from '@vegaprotocol/environment';

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
      className="flex items-center justify-center rounded-md overflow-hidden bg-blue-650"
    >
      <EthereumIcon />
    </div>
  );
};

export const EthereumKey = ({
  address,
  chainId,
}: {
  chainId: number;
  address: string;
}) => {
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
        <BlockExplorerLink sourceChainId={chainId} address={address}>
          {truncateMiddle(address)}
        </BlockExplorerLink>
        <CopyWithCheckmark text={address} />
      </div>
    </div>
  );
};
