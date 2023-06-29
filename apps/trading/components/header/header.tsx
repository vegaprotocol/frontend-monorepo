import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';

interface TradeMarketHeaderProps {
  title: ReactNode;
  children: ReactNode;
}
/*
export const Header = ({ title, children }: TradeMarketHeaderProps) => {
  return (
    <header className="w-screen xl:px-4 pt-2 border-b border-default">
      <div className="xl:flex xl:gap-4 items-end">
        <div className="px-4 xl:px-0 pb-2 xl:pb-3">{title}</div>
        <div
          data-testid="header-summary"
          className="flex flex-nowrap items-end xl:flex-1 w-full overflow-x-auto text-xs"
        >
          {Children.map(children, (child, index) => {
            if (!child) return null;
            return cloneElement(child, {
              id: `header-stat-${index}`,
            });
          })}
        </div>
      </div>
    </header>
  );
};
*/

export const Header = ({ title, children }: TradeMarketHeaderProps) => {
  const headerClasses = classNames(
    'grid',
    'grid-rows-[min-content_min-content]',
    'xl:grid-cols-[min-content_1fr]',
    'border-l border-b border-default',
    'bg-vega-light-100 dark:bg-vega-dark-100'
  );
  return (
    <header className="pl-1">
      <div className={headerClasses}>
        <div className="flex flex-col justify-center pl-4 pt-2 xl:pb-2 pb-0 xl:border-r border-default xl:pr-4">
          {title}
        </div>
        <div data-testid="header-summary" className="min-w-0">
          <div className="px-4 py-2 flex flex-nowrap gap-4 items-center text-xs overflow-x-auto">
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

export const HeaderStat = ({
  children,
  heading,
  id,
  description,
  testId,
}: {
  children: ReactNode;
  heading: string;
  id?: string;
  description?: string | ReactNode;
  testId?: string;
}) => {
  const itemClass =
    'min-w-min last:pr-0 whitespace-nowrap text-neutral-500 dark:text-neutral-400';
  const itemHeading = 'text-black dark:text-white';

  return (
    <div data-testid={testId} className={itemClass}>
      <div data-testid="item-header" id={id}>
        {heading}
      </div>
      <Tooltip description={description}>
        <div
          data-testid="item-value"
          aria-labelledby={id}
          className={itemHeading}
        >
          {children}
        </div>
      </Tooltip>
    </div>
  );
};

export const HeaderTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h1
      data-testid="header-title"
      className="flex gap-4 items-center text-sm md:text-md lg:text-lg whitespace-nowrap"
    >
      {children}
    </h1>
  );
};
