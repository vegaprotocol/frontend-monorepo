import { ConnectionModal } from '../connection-modal';
import { OrientationSplash } from '../orientation-splash';
import { PopoverOpenSplash } from '../popover-open-splash';
import { TransactionModal } from '../transaction-modal';

export const ModalWrapper = () => {
  return (
    <>
      <ConnectionModal />
      <TransactionModal />
      {/* Must be at the bottom to ensure that if we have a connection or transaction pending the popover modal is always shown */}
      <PopoverOpenSplash />
      <OrientationSplash />
    </>
  );
};
