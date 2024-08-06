import { useNetwork } from '@/contexts/network/network-context';

import { NetworkDropdown } from './network-dropdown';
// import { NetworkIndicator } from './network-indicator';

export const locators = {
  networkSwitcher: 'network-switcher',
};

export const NetworkSwitcher = () => {
  const { interactionMode, network } = useNetwork();

  return (
    <div className="flex flex-row">
      {/* <div className="flex flex-col justify-center">
        <NetworkIndicator />
      </div>` */}
      <div
        data-testid={locators.networkSwitcher}
        className="flex flex-col justify-center border rounded-md text-sm px-2 h-6"
        style={{
          borderColor: network.secondaryColor,
          color: network.secondaryColor,
        }}
      >
        {interactionMode ? <div>{network.name}</div> : <NetworkDropdown />}
      </div>
    </div>
  );
};
