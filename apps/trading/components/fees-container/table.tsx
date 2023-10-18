import classNames from 'classnames';
import type { ReactNode } from 'react';

const cellClass = 'px-4 py-2 text-xs font-normal text-left last:text-right';

export const Th = ({ children }: { children?: ReactNode }) => {
  return (
    <th className={classNames(cellClass, 'text-secondary leading-none py-3')}>
      {children}
    </th>
  );
};

export const Td = ({ children }: { children?: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

export const Tr = ({ children }: { children?: ReactNode }) => {
  return (
    <tr className="hover:bg-vega-clight-600 dark:hover:bg-vega-cdark-700">
      {children}
    </tr>
  );
};

export const Table = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full border border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </table>
  );
};

export const THead = ({ children }: { children: ReactNode }) => {
  return (
    <thead className="border-b bg-vega-clight-700 dark:bg-vega-cdark-700 border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </thead>
  );
};
