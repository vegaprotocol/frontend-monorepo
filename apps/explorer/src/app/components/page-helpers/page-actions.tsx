import type { HTMLAttributes } from 'react';

export const PageActions = ({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-row items-start gap-1" {...props}>
    {children}
  </div>
);
