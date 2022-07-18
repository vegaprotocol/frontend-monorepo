import type { ReactNode } from 'react';
import classnames from 'classnames';
import { t } from '@vegaprotocol/react-helpers';

type LayoutCellProps = {
  label?: string;
  hasError?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
};

export const LayoutCell = ({
  hasError,
  label,
  isLoading,
  children,
}: LayoutCellProps) => {
  const classes = [
    'px-8 lg:text-right flex justify-between lg:block',
    'bg-white-60 dark:bg-black-60 lg:bg-transparent lg:dark:bg-transparent',
    'm-2 lg:m-0',
  ];

  return (
    <div className={classnames(classes)}>
      {label && <span className="lg:hidden">{label}</span>}
      <span
        className={classnames('font-mono', {
          'text-danger': !isLoading && hasError,
          'text-white-60 dark:text-black-60': isLoading,
        })}
      >
        {isLoading ? t('Checking') : children || '-'}
      </span>
    </div>
  );
};
