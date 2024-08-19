import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

const cellClass = 'px-4 py-2 text-xs font-normal text-left last:text-right';

export const Th = ({ children, ...props }: { children?: ReactNode }) => {
  return (
    <th
      className={cn(cellClass, 'text-secondary leading-none py-3')}
      {...props}
    >
      {children}
    </th>
  );
};

export const Td = ({ children, ...props }: { children?: ReactNode }) => {
  return (
    <th className={cellClass} {...props}>
      {children}
    </th>
  );
};

export const Tr = ({ children, ...props }: { children?: ReactNode }) => {
  return (
    <tr className="hover:bg-gs-600 " {...props}>
      {children}
    </tr>
  );
};

export const Table = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full border border-separate rounded-sm border-spacing-0 border-gs-600 ">
      {children}
    </table>
  );
};

export const THead = ({ children }: { children: ReactNode }) => {
  return (
    <thead className="border-b bg-surface-2  border-gs-600 ">{children}</thead>
  );
};
