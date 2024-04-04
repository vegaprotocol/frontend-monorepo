import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

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
      <div className="flex-col items-start justify-center hidden pt-2 pb-0 pl-3 lg:flex lg:pl-4 xl:pb-2">
        {title}
      </div>
      <div data-testid="header-summary" className="min-w-0">
        <div className="flex items-center px-3 py-2 overflow-x-auto text-xs lg:px-4 flex-nowrap gap-6">
          {children}
        </div>
      </div>
    </header>
  );
};

type HeaderStatProps = HTMLAttributes<HTMLDivElement> & {
  heading: string;
  id?: string;
  description?: string | ReactNode;
};

export const HeaderStat = ({
  children,
  heading,
  id,
  description,
  ...props
}: HeaderStatProps) => {
  const itemClass = classNames(
    'text-muted',
    'min-w-min last:pr-0 whitespace-nowrap'
  );
  const itemValueClasses = 'text-default';

  return (
    <div {...props} className={classNames(itemClass, props.className)}>
      <div data-testid="item-header" id={id}>
        {heading}
      </div>
      <Tooltip description={description} underline>
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
      className="flex items-center text-lg gap-4 whitespace-nowrap xl:pr-4 xl:border-r border-default"
    >
      {children}
    </h1>
  );
};
