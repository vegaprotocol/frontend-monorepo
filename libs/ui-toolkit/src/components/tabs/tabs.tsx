import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  getValidItem,
  useResizeObserver,
  useLocalStorage,
} from '@vegaprotocol/react-helpers';
import { cn } from '../../utils/cn';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useRef, useState } from 'react';
import { VegaIcon } from '../icon/vega-icons/vega-icon';
import { VegaIconNames } from '../icon/vega-icons/vega-icon-record';
import { Popover } from '../popover/popover';
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
  const [activeTab, setActiveTab] = useState<string | undefined>(
    () => value || defaultValue || children.find((v) => v)?.props.id
  );

  // Bunch of refs in order to detect wrapping in side the tabs so that we
  // can apply a bg color
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [wrapped, setWrapped] = useState(() =>
    isWrapped(tabsRef.current, menuRef.current)
  );

  useResizeObserver(wrapperRef.current, () => {
    setWrapped(isWrapped(tabsRef.current, menuRef.current));
  });

  return (
    <TabsPrimitive.Root
      {...props}
      value={value || activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        if (onValueChange) {
          onValueChange(value);
        }
      }}
      className="h-full grid grid-rows-[min-content_1fr] relative"
    >
      <div ref={wrapperRef} className="flex flex-wrap justify-between min-w-0">
        <TabsPrimitive.List
          className="flex flex-nowrap overflow-visible"
          role="tablist"
          ref={tabsRef}
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            const isActive = child.props.id === (value || activeTab);
            const triggerClass = cn(
              'relative text-xs py-2 px-3',
              {
                'cursor-default bg-surface-2': isActive,
                'text-surface-1-fg': isActive,
                'text-surface-1-fg-muted': !isActive,
              },
              'flex items-center gap-2'
            );
            return (
              <TabsPrimitive.Trigger
                data-testid={child.props.name}
                value={child.props.id}
                className={triggerClass}
              >
                {child.props.indicator}
                {child.props.name}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
        <div
          ref={menuRef}
          className={cn('flex justify-end flex-1 p-1', {
            'bg-surface-1': wrapped,
          })}
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child) || child.props.hidden) return null;
            return (
              <TabsPrimitive.Content
                value={child.props.id}
                className={cn('flex items-center flex-nowrap gap-1', {
                  'justify-end': !wrapped,
                })}
              >
                {child.props.menu}
                {isValidElement(child.props.settings) && (
                  <Popover
                    align="end"
                    trigger={
                      <span className="flex items-center justify-center h-6 w-6">
                        <VegaIcon name={VegaIconNames.COG} size={16} />
                      </span>
                    }
                  >
                    <div className="p-2 lg:p-4 flex justify-end">
                      {child.props.settings}
                    </div>
                  </Popover>
                )}
              </TabsPrimitive.Content>
            );
          })}
        </div>
      </div>
      <div className="relative h-full overflow-auto">
        {Children.map(children, (child) => {
          if (!isValidElement(child) || child.props.hidden) return null;
          return (
            <TabsPrimitive.Content
              value={child.props.id}
              className={cn('h-full', {
                'overflow-hidden': child.props.overflowHidden,
              })}
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
  overflowHidden?: boolean;
  menu?: ReactNode;
  settings?: ReactNode;
}

export const Tab = ({ children, ...props }: TabProps) => {
  return <div {...props}>{children}</div>;
};

export const createActiveTabKey = (key: string) => `active-tab-${key}`;
export const LocalStoragePersistTabs = ({
  storageKey,
  children,
  ...props
}: Omit<TabsProps, 'value' | 'onValueChange'> & { storageKey: string }) => {
  const [value, setValue] = useLocalStorage(createActiveTabKey(storageKey));
  const onValueChange = (value: string) => setValue(value);

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

const isWrapped = (
  tabs: HTMLDivElement | null,
  menu: HTMLDivElement | null
) => {
  if (!tabs || !menu) return;
  const listRect = tabs.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  return menuRect.y > listRect.y;
};
