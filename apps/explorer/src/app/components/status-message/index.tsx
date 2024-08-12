import { cn } from '@vegaprotocol/ui-toolkit';
import React from 'react';

interface StatusMessageProps {
  children: React.ReactNode;
  className?: string;
}

export const StatusMessage = ({
  children,
  className,
  ...props
}: StatusMessageProps) => {
  const classes = cn('font-alpha calt text-2xl mb-28', className);
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  );
};
