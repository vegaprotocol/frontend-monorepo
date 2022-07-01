import type { ReactNode } from 'react';
import clsx from 'clsx';
import { t } from '@vegaprotocol/react-helpers';

type LayoutCellProps = {
  hasError?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
};

export const LayoutCell = ({
  hasError,
  isLoading,
  children,
}: LayoutCellProps) => {
  return (
    <div
      className={clsx('px-8 text-right', {
        'text-danger': !isLoading && hasError,
        'text-white-60 dark:text-black-60': isLoading,
      })}
    >
      {isLoading ? t('Checking') : children || '-'}
    </div>
  );
};
