import { Button } from '@vegaprotocol/ui-toolkit';

import { usePopoverStore } from '@/stores/popover-store';

import { Frame } from '../../frame';
import { ExpandIcon } from '../../icons/expand';
import { Splash } from '../../splash';

export const locators = {
  popoverSplash: 'popover-modal',
  continueHere: 'continue-here',
};

// export const PopoverOpenSplash = () => {
//   const { focusPopover, popoverOpen, isPopoverInstance } = usePopoverStore(
//     (state) => ({
//       popoverOpen: state.popoverOpen,
//       focusPopover: state.focusPopover,
//       isPopoverInstance: state.isPopoverInstance,
//     })
//   );

//   if (!popoverOpen || isPopoverInstance) return null;
//   return (
//     <Splash data-testid={locators.popoverSplash} centered={true}>
//       <div className="px-5">
//         <Frame>
//           <div className="text-center">
//             <div className="flex justify-center">
//               <ExpandIcon size={24} />
//             </div>
//             <p className="my-4 text-lg">
//               You're viewing your wallet in another window
//             </p>
//             <Button
//               fill={true}
//               onClick={focusPopover}
//               variant="primary"
//               data-testid={locators.continueHere}
//             >
//               Continue here
//             </Button>
//           </div>
//         </Frame>
//       </div>
//     </Splash>
//   );
// };
