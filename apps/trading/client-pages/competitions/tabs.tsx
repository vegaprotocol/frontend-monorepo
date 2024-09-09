import { cn } from '@vegaprotocol/ui-toolkit';
import { type ComponentProps } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export const Tabs = (props: ComponentProps<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root {...props} className="flex flex-col gap-4" />
);

export const TabsList = (props: ComponentProps<typeof TabsPrimitive.List>) => {
  return <TabsPrimitive.List {...props} className="flex gap-4 lg:gap-8" />;
};

export const TabsContent = (
  props: ComponentProps<typeof TabsPrimitive.Content>
) => {
  return <TabsPrimitive.Content {...props} />;
};

export const TabsTrigger = (
  props: ComponentProps<typeof TabsPrimitive.Trigger>
) => {
  return (
    <TabsPrimitive.Trigger
      {...props}
      className={cn(
        'relative top-px uppercase border-b-2 py-4 border-transparent text-surface-1-fg-muted',
        'data-[state=active]:border-highlight-secondary data-[state=active]:text-surface-1-fg'
      )}
    />
  );
};
