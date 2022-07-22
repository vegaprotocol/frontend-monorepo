import type { ReactNode } from 'react';

interface VegaTransactionDialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

export const VegaTransactionDialogWrapper = ({
  children,
  icon,
  title,
}: VegaTransactionDialogWrapperProps) => {
  const headerClassName = 'text-h4 font-bold text-black dark:text-white';
  return (
    <div className="flex gap-12 max-w-full">
      <div className="pt-8 fill-current">{icon}</div>
      <div data-testid="order-wrapper" className="flex-1">
        <h1 data-testid="order-status-header" className={headerClassName}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};
