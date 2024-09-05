import {
  forwardRef,
  type ElementRef,
  type ComponentPropsWithoutRef,
} from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@vegaprotocol/ui-toolkit';
import { TinyScroll } from '@vegaprotocol/ui-toolkit';

const SidebarAccordion = forwardRef<
  ElementRef<typeof AccordionPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    {...props}
    className={cn('flex flex-col gap-2 overflow-hidden', className)}
  />
));

SidebarAccordion.displayName = 'SidebarAccordion';

const SidebarAccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'rounded-panel overflow-hidden min-h-[40px]',
      'data-[state=open]:flex-[1] data-[state=closed]:flex-[0_1_auto] transition-[flex] flex flex-col',
      className
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Item>
));
SidebarAccordionItem.displayName = 'SidebarAccordionItem';

const SidebarAccordionHeader = forwardRef<
  ElementRef<typeof AccordionPrimitive.Header>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    {...props}
    className={cn(
      'flex items-center w-full pr-2 bg-surface-2/70',
      'hover:bg-surface-3/50',
      className
    )}
  >
    {children}
  </AccordionPrimitive.Header>
));
SidebarAccordionHeader.displayName = 'SidebarAccordionHeader';

const SidebarAccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex flex-1 items-center justify-between text-sm px-2 py-3 h-10',
      className
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Trigger>
));
SidebarAccordionTrigger.displayName = 'SidebarAccordionTrigger';

const SidebarAccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="flex-1 text-sm min-h-0 bg-surface-1/70 text-surface-1-fg"
    {...props}
  >
    <TinyScroll>{children}</TinyScroll>
  </AccordionPrimitive.Content>
));

SidebarAccordionContent.displayName = 'SidebarAccordionContent';

export {
  SidebarAccordion,
  SidebarAccordionItem,
  SidebarAccordionHeader,
  SidebarAccordionTrigger,
  SidebarAccordionContent,
};
