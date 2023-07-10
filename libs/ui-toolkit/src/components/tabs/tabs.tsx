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
  return (
    <TabsPrimitive.Root
      {...props}
      value={value || activeTab}
      onValueChange={onValueChange || setActiveTab}
      className="h-full grid grid-rows-[min-content_1fr]"
    >
      <div className="border-b border-default">
        <TabsPrimitive.List
          className="flex flex-nowrap overflow-visible"
          role="tablist"
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            const isActive = child.props.id === (value || activeTab);
            const triggerClass = classNames(
              'relative text-xs p-2 border-l border-r first:border-l-0',
              {
                'cursor-default border-default bg-vega-clight-700 dark:bg-vega-cdark-700':
                  isActive,
                'text-default': isActive,
                'text-muted border-transparent': !isActive,
              },
              'flex items-center gap-2'
            );
            const borderClass = classNames(
              'absolute bottom-[-1px] left-0 w-full h-0 border-b',
              'border-vega-clight-700 dark:border-vega-cdark-700',
              { hidden: !isActive }
            );
            return (
              <TabsPrimitive.Trigger
                data-testid={child.props.name}
                value={child.props.id}
                className={triggerClass}
              >
                {child.props.indicator}
                {child.props.name}
                <span className={borderClass} />
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
