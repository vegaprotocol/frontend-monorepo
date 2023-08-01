import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';

interface TradeMarketHeaderProps {
  title: ReactNode;
  children: ReactNode;
}

export const Header = ({ title, children }: TradeMarketHeaderProps) => {
  const headerClasses = classNames(
    'grid',
    'grid-rows-[min-content_min-content]',
    'xl:grid-cols-[min-content_1fr]',
    'border-b border-default',
    'bg-vega-clight-800 dark:bg-vega-cdark-800'
  );
  return (
    <header className={headerClasses}>
      <div className="hidden lg:flex flex-col justify-center items-start pl-3 lg:pl-4 pt-2 xl:pb-2 pb-0">
        {title}
      </div>
      <div data-testid="header-summary" className="min-w-0">
        <div className="px-3 lg:px-4 py-2 flex flex-nowrap gap-4 items-center text-xs overflow-x-auto">
          {children}
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
  const itemClass = classNames(
    'text-muted',
    'min-w-min last:pr-0 whitespace-nowrap'
  );
  const itemValueClasses = 'text-default';

  return (
    <div data-testid={testId} className={itemClass}>
      <div data-testid="item-header" id={id}>
        {heading}
      </div>
      <Tooltip description={description}>
        <div
          data-testid="item-value"
          aria-labelledby={id}
          className={itemValueClasses}
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
      className="flex gap-4 items-center text-lg whitespace-nowrap xl:pr-4 xl:border-r border-default"
    >
      {children}
    </h1>
  );
};
