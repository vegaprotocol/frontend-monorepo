import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { CopyWithCheckmark } from '@/components/copy-with-check';
import { DataTable } from '@/components/data-table';

export const locators = {
  title: 'unknown-network-key-title',
  explorerLink: 'unknown-network-explorer-link',
};

export const UnknownNetworkKey = ({ address }: { address: string }) => {
  return (
    <div className="flex items-center">
      <DataTable
        items={[
          [
            'Address',
            <div>
              {' '}
              <span
                className="text-vega-dark-400"
                data-testid={locators.explorerLink}
              >
                {truncateMiddle(address)}
              </span>
              <CopyWithCheckmark text={address} />
            </div>,
          ],
        ]}
      />
    </div>
  );
};
