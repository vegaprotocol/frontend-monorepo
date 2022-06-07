import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useState } from 'react';

interface GridTabsProps {
  children: ReactElement<GridTabProps>[];
}

export const GridTabs = ({ children }: GridTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return children[0].props.id;
  });

  return (
    <Tabs.Root
      value={activeTab}
      className="h-full grid grid-rows-[min-content_1fr]"
      onValueChange={(value) => setActiveTab(value)}
    >
      <Tabs.List
        className="flex flex-nowrap gap-4 overflow-x-auto"
        role="tablist"
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          const isActive = child.props.id === activeTab;
          const triggerClass = classNames('py-4', 'px-12', 'capitalize', {
            'text-black dark:text-vega-yellow': isActive,
            'bg-white dark:bg-black': isActive,
            'text-black dark:text-white': !isActive,
            'bg-black-10 dark:bg-white-25': !isActive,
          });
          return (
            <Tabs.Trigger
              data-testid={child.props.name}
              value={child.props.id}
              className={triggerClass}
            >
              {child.props.name}
            </Tabs.Trigger>
          );
        })}
        <div className="bg-black-10 dark:bg-white-25 grow"></div>
      </Tabs.List>
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          return (
            <Tabs.Content value={child.props.id} className="h-full">
              {child.props.children}
            </Tabs.Content>
          );
        })}
      </div>
    </Tabs.Root>
  );
};

interface GridTabProps {
  children: ReactNode;
  id: string;
  name: string;
}

export const GridTab = ({ children }: GridTabProps) => {
  return <div>{children}</div>;
};
