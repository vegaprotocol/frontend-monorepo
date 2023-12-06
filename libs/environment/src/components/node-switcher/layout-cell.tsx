import type { ReactNode } from 'react';
import classnames from 'classnames';
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
    <div className={classnames(classes)}>
      {label && (
        <>
          <span className="lg:hidden text-xs text-vega-clight-200 dark:text-vega-cdark-200 whitespace-nowrap">
            {label}
          </span>
          <span
            /* separator */
            aria-hidden
            className="border-b border-dashed border-b-vega-clight-400 dark:border-b-vega-cdark-400 w-full h-[9px]"
          ></span>
        </>
      )}
      <span
        data-testid={dataTestId}
        className={classnames('font-mono text-xs lg:text-sm', {
          'text-danger': !isLoading && hasError,
          'text-muted': isLoading,
        })}
      >
        {isLoading ? t('Checking') : children || '-'}
      </span>
    </div>
  );
};
