import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { chdir } from 'process';
import {
  Children,
  isValidElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

interface GridTabsProps {
  children: ReactNode;
  group: string;
}

export const GridTabs = ({ children, group }: GridTabsProps) => {
  const { query, asPath, replace } = useRouter();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (query[group]) {
      return query[group];
    }

    // Default to first tab
    return children[0].props.name;
  });

  // Update the query string in the url when the active tab changes
  // uses group property as the query stirng key
  useEffect(() => {
    const [url, queryString] = asPath.split('?');
    const searchParams = new URLSearchParams(queryString);
    searchParams.set(group, activeTab as string);
    replace(`${url}?${searchParams.toString()}`);
    // replace and using asPath causes a render loop
    // eslint-disable-next-line
  }, [activeTab, group]);

  return (
    <Tabs.Root
      value={activeTab}
      className="h-full grid grid-rows-[min-content_1fr]"
      onValueChange={(value) => setActiveTab(value)}
    >
      {/* the tabs */}
      <Tabs.List className="flex gap-[2px] bg-neutral-200" role="tablist">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          const isActive = child.props.name === activeTab;
          const triggerClass = classNames(
            'py-4',
            'px-12',
            'border-t border-neutral-200',
            'capitalize',
            {
              'text-vega-pink': isActive,
              'bg-white': isActive,
            }
          );
          return (
            <Tabs.Trigger value={child.props.name} className={triggerClass}>
              {child.props.name}
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
      {/* the content */}
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          return (
            <Tabs.Content value={child.props.name}>
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
  name: string;
}

export const GridTab = ({ children }: GridTabProps) => {
  return <div>{children}</div>;
};
