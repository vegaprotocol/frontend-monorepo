import classNames from 'classnames';
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
      className={classNames(
        'relative top-px uppercase border-b-2 py-4 border-transparent text-muted',
        'data-[state=active]:border-vega-yellow data-[state=active]:text-gs-50'
      )}
    />
  );
};
