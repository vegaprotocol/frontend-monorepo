import type { ReactNode } from 'react';
import classnames from 'classnames';
import { t } from '@vegaprotocol/i18n';

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
  const classes = [
    'lg:text-right flex justify-between lg:block',
    'my-2 lg:my-0',
  ];

  return (
    <div className={classnames(classes)}>
      {label && <span className="lg:hidden">{label}</span>}
      <span
        data-testid={dataTestId}
        className={classnames('font-mono', {
          'text-danger': !isLoading && hasError,
          'text-neutral-800 dark:text-neutral-200': isLoading,
        })}
      >
        {isLoading ? t('Checking') : children || '-'}
      </span>
    </div>
  );
};
