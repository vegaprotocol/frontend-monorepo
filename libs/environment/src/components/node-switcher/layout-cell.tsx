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
          'text-muted': isLoading,
        })}
      >
        {isLoading ? t('Checking') : children || '-'}
      </span>
    </div>
  );
};
