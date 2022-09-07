import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { ReactElement, ReactNode } from 'react';
import { Children } from 'react';
import { cloneElement } from 'react';

interface TradeMarketHeaderProps {
  title: ReactNode;
  children: ReactElement[];
}

export const Header = ({ title, children }: TradeMarketHeaderProps) => {
  return (
    <header className="w-screen xl:px-4 pt-4 border-b border-neutral-300 dark:border-neutral-700">
      <div className="xl:flex xl:gap-4  items-start">
        <div className="px-4 mb-2 xl:mb-0 sm:text-lg md:text-xl lg:text-2xl">
          {title}
        </div>
        <div
          data-testid="market-summary"
          className="flex flex-nowrap items-start xl:flex-1 w-full overflow-x-auto text-xs "
        >
          {Children.map(children, (child, index) => {
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
}: {
  children: ReactNode;
  heading: string;
  id?: string;
  description?: string | ReactNode;
}) => {
  const itemClass =
    'min-w-min w-[120px] whitespace-nowrap pb-3 px-4 border-l border-neutral-300 dark:border-neutral-700';
  const itemHeading = 'text-neutral-400';

  return (
    <div className={itemClass}>
      <Tooltip description={description}>
        <div id={id} className={itemHeading}>
          {heading}
        </div>
      </Tooltip>
      <div aria-labelledby={id}>{children}</div>
    </div>
  );
};
