import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { ReactElement, ReactNode } from 'react';
import { Children } from 'react';
import { cloneElement } from 'react';

interface TradeMarketHeaderProps {
  title: ReactNode;
  children: Array<ReactElement | null>;
}

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
    'min-w-min w-[120px] whitespace-nowrap pb-3 px-4 border-l border-default first:border-none text-neutral-500 dark:text-neutral-400';
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

export const HeaderTitle = ({
  primaryContent,
  secondaryContent,
}: {
  primaryContent: ReactNode;
  secondaryContent?: ReactNode;
}) => {
  return (
    <div className="text-left" data-testid="header-title">
      <div className="text-sm md:text-md lg:text-lg whitespace-nowrap !leading-[1]">
        {primaryContent}
      </div>
      {secondaryContent && (
        <div className="text-xs whitespace-nowrap text-vega-light-300 dark:text-vega-dark-300">
          {secondaryContent}
        </div>
      )}
    </div>
  );
};
