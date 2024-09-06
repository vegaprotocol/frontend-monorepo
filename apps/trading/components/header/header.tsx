import { TinyScroll, Tooltip } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';
import type { HTMLAttributes, ReactNode } from 'react';

interface TradeMarketHeaderProps {
  title: ReactNode;
  children: ReactNode;
}

export const Header = ({ title, children }: TradeMarketHeaderProps) => {
  return (
    <header className="h-full flex">
      <div className="flex flex-col items-start justify-center pl-2">
        {title}
      </div>
      <div data-testid="header-summary" className="relative grow min-w-0">
        <TinyScroll orientation="horizontal">
          <div className="flex items-center px-3 py-3 text-xs lg:px-4 flex-nowrap gap-6">
            {children}
          </div>
        </TinyScroll>
        <span className="absolute top-0 right-0 h-full w-14 bg-gradient-to-r from-transparent to-surface-1/70" />
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
  return (
    <div
      {...props}
      className={cn('min-w-min last:pr-0 whitespace-nowrap', props.className)}
    >
      <div
        data-testid="item-header"
        id={id}
        className="text-surface-1-fg-muted"
      >
        {heading}
      </div>
      <Tooltip description={description} underline>
        <div data-testid="item-value" aria-labelledby={id}>
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
      className="flex gap-4 items-center whitespace-nowrap xl:pr-4 xl:border-r border-gs-300 dark:border-gs-700"
    >
      {children}
    </h1>
  );
};
