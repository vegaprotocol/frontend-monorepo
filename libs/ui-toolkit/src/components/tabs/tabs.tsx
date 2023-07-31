import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  useLocalStorageSnapshot,
  getValidItem,
} from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useState } from 'react';
export interface TabsProps extends TabsPrimitive.TabsProps {
  children: (ReactElement<TabProps> | null)[];
}

export const Tabs = ({
  children,
  defaultValue,
  value,
  onValueChange,
  ...props
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(() => {
    if (defaultValue) {
      return defaultValue;
    }
    return children.find((v) => v)?.props.id;
  });

  console.log(activeTab);
  // const activeChild = Children.toArray(children).find(
  //   (child) => child.props.id === activeTab
  // );
  // const menu = activeChild.props.menu;

  return (
    <TabsPrimitive.Root
      {...props}
      value={value || activeTab}
      onValueChange={onValueChange || setActiveTab}
      className="h-full grid grid-rows-[min-content_1fr]"
    >
      <div className="flex border-b border-default min-w-0">
        <TabsPrimitive.List
          className="flex flex-nowrap overflow-visible"
          role="tablist"
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            const isActive = child.props.id === (value || activeTab);
            const triggerClass = classNames(
              'relative text-xs py-2 px-3 border-l border-r first:border-l-0',
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
        <div className="ml-auto p-1">
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            return (
              <TabsPrimitive.Content
                value={child.props.id}
                className="flex flex-nowrap gap-1 justify-end"
              >
                {child.props.menu}
              </TabsPrimitive.Content>
            );
          })}
        </div>
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
  menu?: ReactNode;
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
        Children.map(
          children.filter((c): c is ReactElement<TabProps> => c !== null),
          (child) => child.props.id
        ),
        undefined
      )}
      onValueChange={onValueChange}
    />
  );
};
