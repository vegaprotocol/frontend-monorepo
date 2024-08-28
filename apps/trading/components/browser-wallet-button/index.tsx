import { Popover, Icon } from '@vegaprotocol/ui-toolkit';

import { BrowserWallet } from '../browser-wallet';

export const InBrowserWalletButton = () => {
  return (
    <Popover
      trigger={
        <span className="flex items-center justify-center w-7 h-7 hover:bg-surface-3 rounded-full">
          <Icon name="lab-test" />
        </span>
      }
      align="end"
      sideOffset={14}
    >
      <div style={{ width: 360, height: 600 }}>
        <BrowserWallet />
      </div>
    </Popover>
  );
};
