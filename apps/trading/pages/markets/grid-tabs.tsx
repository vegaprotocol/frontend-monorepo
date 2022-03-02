import classNames from 'classnames';
import { useRouter } from 'next/router';
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

  // Using replace inside an effect causes a render loop. Seems like its not using useCallback
  // eslint-disable-next-line
  const safeReplace = useCallback((path: string) => replace(path), []);

  // Update the query string in the url when the active tab changes
  // uses group property as the query stirng key
  useEffect(() => {
    const [url, queryString] = asPath.split('?');
    const searchParams = new URLSearchParams(queryString);
    searchParams.set(group, activeTab as string);
    safeReplace(`${url}?${searchParams.toString()}`);
  }, [activeTab, group, asPath, safeReplace]);

  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      {/* the tabs */}
      <div className="flex gap-[2px] bg-neutral-200" role="tablist">
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            return (
              <GridTabControl
                group={group}
                name={child.props.name}
                isActive={activeTab === child.props.name}
                onClick={() => setActiveTab(child.props.name)}
              />
            );
          }

          return null;
        })}
      </div>
      {/* the content */}
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (isValidElement(child) && activeTab === child.props.name) {
            return (
              <GridTabPanel group={group} name={child.props.name}>
                {child.props.children}
              </GridTabPanel>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

interface GridTabProps {
  children: ReactNode;
  name: string;
}

export const GridTab = ({ children }: GridTabProps) => {
  return <div>{children}</div>;
};

interface GridTabControlProps {
  group: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const GridTabControl = ({
  group,
  name,
  isActive,
  onClick,
}: GridTabControlProps) => {
  const buttonClass = classNames(
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
    <button
      className={buttonClass}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${group}-${name}`}
      id={`tab-${group}-${name}`}
    >
      {name}
    </button>
  );
};

interface GridTabPanelProps {
  group: string;
  name: string;
  children: ReactNode;
}

const GridTabPanel = ({ group, name, children }: GridTabPanelProps) => {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${group}-${name}`}
      aria-labelledby={`tab-${group}-${name}`}
    >
      {children}
    </div>
  );
};
