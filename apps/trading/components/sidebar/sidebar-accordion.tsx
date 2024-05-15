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
    className={classNames(
      'data-[state=open]:grow data-[state=closed]:shrink-0 border border-default flex flex-col min-h-0',
      className
    )}
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
        'flex flex-1 items-center justify-between text-sm p-2 bg-vega-clight-600 dark:bg-vega-dark-600 hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500 border-b border-default',
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
    className="text-sm grow overflow-hidden"
    {...props}
  >
    <div className={classNames('p-2 h-full overflow-y-auto', className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));

SidebarAccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  SidebarAccordion,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
  SidebarAccordionContent,
};
