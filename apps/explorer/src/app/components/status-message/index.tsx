import classnames from 'classnames';
import React from 'react';

interface StatusMessageProps {
  children: React.ReactNode;
  className?: string;
}

export const StatusMessage = ({ children, className }: StatusMessageProps) => {
  const classes = classnames('font-alpha text-h4 mb-28', className);
  return <h3 className={classes}>{children}</h3>;
};
