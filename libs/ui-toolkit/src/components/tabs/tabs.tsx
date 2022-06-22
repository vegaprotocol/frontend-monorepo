import * as TabsPrimitive from '@radix-ui/react-tabs';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useState } from 'react';

interface TabsProps {
  children: ReactElement<TabProps>[];
}

export const Tabs = ({ children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return children[0].props.id;
  });

  return (
    <TabsPrimitive.Root
      value={activeTab}
      className="h-full grid grid-rows-[min-content_1fr]"
      onValueChange={(value) => setActiveTab(value)}
    >
      <div className="bg-black-10 dark:bg-white-10">
        <TabsPrimitive.List
          className="flex flex-nowrap gap-4 overflow-x-auto"
          role="tablist"
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child)) return null;
            const isActive = child.props.id === activeTab;
            const triggerClass = classNames(
              'py-4 px-20',
              'capitalize',
              'focus-visible:outline-none focus-visible:shadow-inset-vega-pink dark:focus-visible:shadow-inset-vega-yellow',
              {
                'font-semibold text-vega-pink dark:text-vega-yellow': isActive,
                'bg-white dark:bg-black': isActive,
                'text-black dark:text-white': !isActive,
                'bg-white-90 dark:bg-black-70 hover:bg-white-95 dark:hover:bg-black-80':
                  !isActive,
              }
            );
            return (
              <TabsPrimitive.Trigger
                data-testid={child.props.name}
                value={child.props.id}
                className={triggerClass}
              >
                {child.props.name}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </div>
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          return (
            <TabsPrimitive.Content
              value={child.props.id}
              className="h-full"
              data-testid={`tab-${child.props.id}`}
            >
              {child.props.children}
            </TabsPrimitive.Content>
          );
        })}
      </div>
    </TabsPrimitive.Root>
  );
};

interface TabProps {
  children: ReactNode;
  id: string;
  name: string;
}

export const Tab = ({ children, ...props }: TabProps) => {
  return <div {...props}>{children}</div>;
};
