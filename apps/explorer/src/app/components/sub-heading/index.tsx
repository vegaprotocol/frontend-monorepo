import { cn } from '@vegaprotocol/ui-toolkit';
import type { HTMLAttributes } from 'react';

interface SubHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const SubHeading = ({
  children,
  className,
  ...props
}: SubHeadingProps) => {
  const classes = cn(
    'font-alt calt',
    'text-2xl',
    'uppercase',
    'mt-8 mb-2',
    'truncate',
    className
  );
  return (
    <h2 {...props} className={classes}>
      {children}
    </h2>
  );
};
