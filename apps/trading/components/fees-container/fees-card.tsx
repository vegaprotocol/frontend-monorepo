import classNames from 'classnames';
import type { ReactNode } from 'react';

export const FeeCard = ({
  children,
  title,
  className,
  loading = false,
}: {
  children: ReactNode;
  title: string;
  className?: string;
  loading?: boolean;
}) => {
  return (
    <div
      className={classNames(
        'p-4 bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full lg:col-auto',
        'rounded-lg',
        className
      )}
    >
      <h2 className="mb-3">{title}</h2>
      {loading ? <FeeCardLoader /> : children}
    </div>
  );
};

export const FeeCardLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-5 bg-vega-clight-600 dark:bg-vega-cdark-600" />
      <div className="w-3/4 h-6 bg-vega-clight-600 dark:bg-vega-cdark-600" />
    </div>
  );
};
