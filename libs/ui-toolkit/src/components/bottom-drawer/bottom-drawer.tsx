import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@vegaprotocol/ui-toolkit';

const BottomDrawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
BottomDrawer.displayName = 'BottomDrawer';

const BottomDrawerTrigger = DrawerPrimitive.Trigger;

const BottomDrawerPortal = DrawerPrimitive.Portal;

const BottomDrawerClose = DrawerPrimitive.Close;

const BottomDrawerOverlay = forwardRef<
  ElementRef<typeof DrawerPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-10 bg-black/80', className)}
    {...props}
  />
));
BottomDrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const BottomDrawerContent = forwardRef<
  ElementRef<typeof DrawerPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <BottomDrawerPortal>
    <BottomDrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 mt-24 flex h-auto flex-col bg-gs-900',
        className
      )}
      {...props}
    >
      <div className="mx-auto my-2 h-2 w-[100px] rounded-full bg-gs-200" />
      <div className="max-h-[85vh] overflow-y-auto">{children}</div>
    </DrawerPrimitive.Content>
  </BottomDrawerPortal>
));
BottomDrawerContent.displayName = 'BottomDrawerContent';

export {
  BottomDrawer,
  BottomDrawerPortal,
  BottomDrawerOverlay,
  BottomDrawerTrigger,
  BottomDrawerClose,
  BottomDrawerContent,
};
