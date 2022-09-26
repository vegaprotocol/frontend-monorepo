import * as TabsPrimitive from '@radix-ui/react-tabs';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useState } from 'react';

interface TabsProps {
  children: ReactElement<TabProps>[];
  active?: string;
}

export const Tabs = ({ children, active: activeDefaultId }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return activeDefaultId ?? children[0].props.id;
  });

  return (
    <TabsPrimitive.Root
      value={activeTab}
      className="h-full grid grid-rows-[min-content_1fr]"
      onValueChange={(value) => setActiveTab(value)}
    >
      <div className="border-b border-default">
        <TabsPrimitive.List
          className="flex flex-nowrap overflow-visible bg-neutral-50 dark:bg-neutral-800"
          role="tablist"
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            const isActive = child.props.id === activeTab;
            const triggerClass = classNames(
              'relative px-4 py-2 border-r border-default',
              'uppercase',
              'focus-visible:underline outline-none',
              {
                'cursor-default bg-white dark:bg-black': isActive,
                'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300':
                  !isActive,
              }
            );
            const borderClass = classNames(
              'absolute bottom-[-1px] left-0 w-full h-0 border-b',
              'border-b-white dark:border-b-black',
              { hidden: !isActive }
            );
            return (
              <TabsPrimitive.Trigger
                data-testid={child.props.name}
                value={child.props.id}
                className={triggerClass}
              >
                {child.props.name}
                <span className={borderClass} />
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </div>
      <div className="h-full overflow-auto" tabIndex={-1}>
        {Children.map(children, (child) => {
          if (!isValidElement(child) || child.props.hidden) return null;
          return (
            <TabsPrimitive.Content
              value={child.props.id}
              className="h-full bg-white dark:bg-black"
              data-testid={`tab-${child.props.id}`}
              tabIndex={-1}
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
  hidden?: boolean;
}

export const Tab = ({ children, ...props }: TabProps) => {
  return <div {...props}>{children}</div>;
};
