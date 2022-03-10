import React, { ThHTMLAttributes } from 'react';
import classnames from 'classnames';

interface TableProps {
  children: React.ReactNode;
}

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableChildProps {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
  modifier?: 'bordered' | 'background';
}

export const Table = ({ children }: TableProps) => {
  return (
    <div className="overflow-x-auto whitespace-nowrap mb-28">
      <table className="w-full">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export const TableRow = ({
  children,
  className,
  dataTestId,
  modifier,
}: TableChildProps) => {
  const cellClasses = classnames(className, {
    'border-b border-white-40': modifier === 'bordered',
    'bg-white-25 border-b-4 border-b-black': modifier === 'background',
  });
  return (
    <tr className={cellClasses} data-testid={dataTestId || null}>
      {children}
    </tr>
  );
};

export const TableHeader = ({
  children,
  className,
  ...props
}: TableHeaderProps) => {
  const cellClasses = classnames(className, {
    'text-left, font-normal': props?.scope === 'row',
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
  dataTestId,
  modifier,
}: TableChildProps) => {
  const cellClasses = classnames(className, {
    'py-4': modifier === 'bordered',
  });
  return (
    <td className={cellClasses} data-testid={dataTestId || null}>
      {children}
    </td>
  );
};
