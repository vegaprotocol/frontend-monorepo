import type { ThHTMLAttributes } from 'react';
import React from 'react';
import classnames from 'classnames';

interface TableProps extends ThHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps
  extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps extends ThHTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
  modifier?: 'bordered' | 'background';
}

interface TableCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  modifier?: 'bordered' | 'background';
}

export const Table = ({ children, className, ...props }: TableProps) => {
  const classes = classnames(className, 'overflow-x-auto whitespace-nowrap');
  return (
    <div className={classes}>
      <table className="w-full" {...props}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export const TableHeader = ({
  children,
  className,
  ...props
}: TableHeaderProps) => {
  const cellClasses = classnames(className, {
    'text-left font-normal': props?.scope === 'row',
  });
  return (
    <th className={cellClasses} {...props}>
      {children}
    </th>
  );
};

export const TableRow = ({
  children,
  className,
  modifier,
  ...props
}: TableRowProps) => {
  const cellClasses = classnames(className, {
    'border-b border-white-40': modifier === 'bordered',
    'bg-white-25 border-b-4 border-b-black': modifier === 'background',
  });
  return (
    <tr className={cellClasses} {...props}>
      {children}
    </tr>
  );
};

export const TableCell = ({
  children,
  className,
  modifier,
  ...props
}: TableCellProps) => {
  const cellClasses = classnames(className, {
    'py-4': modifier === 'bordered',
  });
  return (
    <td className={cellClasses} {...props}>
      {children}
    </td>
  );
};
