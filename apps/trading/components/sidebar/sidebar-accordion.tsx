import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';

const SidebarAccordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    {...props}
    className={classNames('flex flex-col gap-1', className)}
  />
));

SidebarAccordion.displayName = 'SidebarAccordion';

const SidebarAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={classNames('border border-default', className)}
    {...props}
  />
));
SidebarAccordionItem.displayName = 'AccordionItem';

const SidebarAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={classNames(
        'flex flex-1 items-center justify-between text-sm p-2 bg-vega-clight-600 dark:bg-vega-dark-600 border-b border-default',
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
SidebarAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const SidebarAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={classNames('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

SidebarAccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  SidebarAccordion,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
  SidebarAccordionContent,
};
