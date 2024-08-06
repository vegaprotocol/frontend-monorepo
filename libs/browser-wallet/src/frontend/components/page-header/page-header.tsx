import { useNetwork } from '@/contexts/network/network-context';

import { VegaIcon } from '../icons/vega-icon';
import { NetworkSwitcher } from './network-switcher';
// import { PopoutButton } from './popout-button';

export const locators = {
  pageHeader: 'page-header',
};

export const PageHeader = () => {
  const { network } = useNetwork();

  return (
    <div
      style={{ backgroundColor: network.color }}
      data-testid={locators.pageHeader}
      className="p-3 flex justify-between items-center border-b border-1 border-vega-dark-150"
    >
      <VegaIcon
        size={40}
        backgroundColor="none"
        color={network.secondaryColor}
      />
      <div className="flex justify-between items center">
        <NetworkSwitcher />
        {/* <PopoutButton /> */}
      </div>
    </div>
  );
};
