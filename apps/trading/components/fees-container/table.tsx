import classNames from 'classnames';
import type { ReactNode } from 'react';

const cellClass = 'px-4 py-2 text-xs font-normal text-left last:text-right';

export const Th = ({
  children,
  testId,
}: {
  children?: ReactNode;
  testId?: string;
}) => {
  return (
    <th
      className={classNames(cellClass, 'text-secondary leading-none py-3')}
      data-testid={testId}
    >
      {children}
    </th>
  );
};

export const Td = ({
  children,
  testId,
}: {
  children?: ReactNode;
  testId?: string;
}) => {
  return (
    <td className={cellClass} data-testid={testId}>
      {children}
    </td>
  );
};

export const Tr = ({
  children,
  testId,
}: {
  children?: ReactNode;
  testId?: string;
}) => {
  return (
    <tr
      className="hover:bg-vega-clight-600 dark:hover:bg-vega-cdark-700"
      data-testid={testId}
    >
      {children}
    </tr>
  );
};

export const Table = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full border border-separate rounded-sm border-spacing-0 border-vega-clight-600 dark:border-vega-cdark-600">
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
