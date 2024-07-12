import classNames from 'classnames';
import { type ComponentProps } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export const Tabs = (props: ComponentProps<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root {...props} />
);

export const TabsList = (props: ComponentProps<typeof TabsPrimitive.List>) => {
  return (
    <TabsPrimitive.List
      {...props}
      className="flex gap-4 lg:gap-8 mb-4 border-b border-default"
    />
  );
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
        'data-[state=active]:border-vega-yellow data-[state=active]:text-vega-clight-50 data-[state=active]:dark:text-vega-cdark-50'
      )}
    />
  );
};
