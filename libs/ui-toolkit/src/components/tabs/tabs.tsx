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
      <div className="border-b-[1px] border-neutral-300 dark:border-neutral-700">
        <TabsPrimitive.List
          className="flex flex-nowrap overflow-x-auto"
          role="tablist"
        >
          <div>
            {Children.map(children, (child) => {
              if (!isValidElement(child)) return null;
              // const isActive = child.props.id === activeTab;
              const triggerClass = classNames(
                'px-4 py-2 border-r-[1px] border-neutral-300 dark:border-neutral-700',
                'text-white dark:text-white',
                'uppercase'
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
          </div>
        </TabsPrimitive.List>
      </div>
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          return (
            <TabsPrimitive.Content
              value={child.props.id}
              className="h-full bg-white dark:bg-black"
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
