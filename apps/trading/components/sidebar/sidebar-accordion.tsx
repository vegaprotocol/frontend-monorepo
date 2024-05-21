import {
  forwardRef,
  type ElementRef,
  type ComponentPropsWithoutRef,
} from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { TinyScroll } from '@vegaprotocol/ui-toolkit';

const SidebarAccordion = forwardRef<
  ElementRef<typeof AccordionPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    {...props}
    className={classNames('flex flex-col gap-1 overflow-hidden', className)}
  />
));

SidebarAccordion.displayName = 'SidebarAccordion';

const SidebarAccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={classNames(
      'data-[state=open]:flex-[1] data-[state=closed]:flex-[0_1_auto] border border-default transition-[flex] flex flex-col min-h-[39px] rounded-sm',
      className
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Item>
));
SidebarAccordionItem.displayName = 'SidebarAccordionItem';

const SidebarAccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={classNames(
        'flex flex-1 items-center justify-between text-sm p-2 border-b border-default',
        'bg-vega-clight-800 dark:bg-vega-cdark-800',
        'hover:bg-vega-clight-600 dark:hover:bg-vega-cdark-600',
        'data-[state=open]:bg-vega-clight-600 dark:data-[state=open]:bg-vega-cdark-600',
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
SidebarAccordionTrigger.displayName = 'SidebarAccordionTrigger';

const SidebarAccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="flex-1 text-sm min-h-0"
    {...props}
  >
    <TinyScroll className="overflow-y-auto overflow-x-hidden h-full">
      {children}
    </TinyScroll>
  </AccordionPrimitive.Content>
));

SidebarAccordionContent.displayName = 'SidebarAccordionContent';

export {
  SidebarAccordion,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
  SidebarAccordionContent,
};
