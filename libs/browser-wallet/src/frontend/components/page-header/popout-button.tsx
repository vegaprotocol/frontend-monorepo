// import config from '!/config';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useNetwork } from '@/contexts/network/network-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { useGlobalsStore } from '@/stores/globals';
import { usePopoverStore } from '@/stores/popover-store';

import { Cross } from '../icons/cross';
import { ExpandIcon } from '../icons/expand';

export const locators = {
  openPopoutButton: 'open-popout-button',
};

const useOpenInNewWindow = () => {
  const { request } = useJsonRpcClient();

  return async () => {
    await request(RpcMethods.OpenPopout, null);
    // if (config.closeWindowOnPopupOpen) {
    //   window.close();
    // }
  };
};

// export const PopoutButton = () => {
//   const { isMobile } = useGlobalsStore((state) => ({
//     isMobile: state.isMobile,
//   }));
//   const { isPopoverInstance, focusPopover } = usePopoverStore((state) => ({
//     isPopoverInstance: state.isPopoverInstance,
//     focusPopover: state.focusPopover,
//   }));
//   const open = useOpenInNewWindow();
//   const { network } = useNetwork();

//   // if (!config.features?.popoutHeader || isMobile) return null;
//   return (
//     <button
//       data-testid={locators.openPopoutButton}
//       onClick={isPopoverInstance ? focusPopover : open}
//       className="border rounded-md text-sm h-6 ml-3 px-1"
//       style={{
//         borderColor: network.secondaryColor,
//         color: network.secondaryColor,
//       }}
//     >
//       {isPopoverInstance ? (
//         <Cross className="h-4 w-4 flex justify-between items-center" />
//       ) : (
//         <ExpandIcon size={16} />
//       )}
//     </button>
//   );
// };
