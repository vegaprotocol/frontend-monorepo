import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  useLocalStorageSnapshot,
  getValidItem,
} from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useState } from 'react';
export interface TabsProps extends TabsPrimitive.TabsProps {
  children: ReactElement<TabProps>[];
}

export const Tabs = ({
  children,
  defaultValue,
  value,
  onValueChange,
  ...props
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (defaultValue) {
      return defaultValue;
    }
    return children[0].props.id;
  });
  const tabLength = Children.map(children, (child) =>
    isValidElement(child)
  ).filter((item) => item).length;
  return (
    <TabsPrimitive.Root
      {...props}
      value={value || activeTab}
      onValueChange={onValueChange || setActiveTab}
      className="h-full grid grid-rows-[min-content_1fr]"
    >
      <div className="border-b border-default">
        <TabsPrimitive.List
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${tabLength}, fit-content(${
              tabLength ? 100 / tabLength : '100'
            }%))`,
          }}
          role="tablist"
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            const isActive = child.props.id === (value || activeTab);
            const triggerClass = classNames(
              'relative px-4 py-1 border-r border-default',
              'uppercase',
              {
                'cursor-default bg-white dark:bg-black': isActive,
                'text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300':
                  !isActive,
              },
              'text-ellipsis overflow-hidden'
            );
            return (
              <TabsPrimitive.Trigger
                data-testid={child.props.name}
                value={child.props.id}
                className={triggerClass}
                style={{ height: 'calc(100% + 1px)' }}
              >
                {child.props.indicator}
                {child.props.name}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </div>
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (!isValidElement(child) || child.props.hidden) return null;
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
  indicator?: ReactNode;
  hidden?: boolean;
}

export const Tab = ({ children, ...props }: TabProps) => {
  return <div {...props}>{children}</div>;
};

export const LocalStoragePersistTabs = ({
  storageKey,
  children,
  ...props
}: Omit<TabsProps, 'value' | 'onValueChange'> & { storageKey: string }) => {
  const [value, onValueChange] = useLocalStorageSnapshot(
    `active-tab-${storageKey}`
  );
  return (
    <Tabs
      {...props}
      children={children}
      value={getValidItem(
        value,
        Children.map(children, (child) => child.props.id),
        undefined
      )}
      onValueChange={onValueChange}
    />
  );
};
