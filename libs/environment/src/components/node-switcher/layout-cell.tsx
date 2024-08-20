import type { ReactNode } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';

type LayoutCellProps = {
  label?: string;
  hasError?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  dataTestId?: string;
};

export const LayoutCell = ({
  hasError,
  label,
  isLoading,
  children,
  dataTestId,
}: LayoutCellProps) => {
  const t = useT();
  const classes = [
    'lg:text-right flex lg:block justify-stretch gap-2',
    'my-2 lg:my-0',
  ];

  return (
    <div className={cn(classes)}>
      {label && (
        <>
          <span className="lg:hidden text-xs whitespace-nowrap">{label}</span>
          <span
            /* separator */
            aria-hidden
            className="border-b border-dashed border-gs-300 dark:border-gs-700 w-full h-[9px]"
          />
        </>
      )}
      <span
        data-testid={dataTestId}
        className={cn('font-mono text-xs lg:text-sm', {
          'text-intent-danger': !isLoading && hasError,
          'text-surface-0-fg-muted': isLoading,
        })}
      >
        {isLoading ? t('Checking') : children || '-'}
      </span>
    </div>
  );
};
