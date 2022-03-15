import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  Children,
  isValidElement,
  ReactNode,
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
      <Tabs.List
        className="flex flex-nowrap gap-4 overflow-x-auto"
        role="tablist"
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          const isActive = child.props.name === activeTab;
          const triggerClass = classNames('py-4', 'px-12', 'capitalize', {
            'text-black dark:text-vega-yellow': isActive,
            'bg-white dark:bg-black': isActive,
            'text-black dark:text-white': !isActive,
            'bg-black-10 dark:bg-white-10': !isActive,
          });
          return (
            <Tabs.Trigger
              data-testid={child.props.name}
              value={child.props.name}
              className={triggerClass}
            >
              {child.props.name}
            </Tabs.Trigger>
          );
        })}
        <div className="bg-black-10 dark:bg-white-10 grow"></div>
      </Tabs.List>
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
