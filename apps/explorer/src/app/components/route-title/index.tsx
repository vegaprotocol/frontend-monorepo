import classnames from 'classnames';
import React from 'react';

interface RouteTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const RouteTitle = ({ children, className }: RouteTitleProps) => {
  const classes = classnames(
    'font-alpha',
    'text-h3',
    'uppercase',
    'mt-12',
    'mb-28',
    className
  );
  return <h1 className={classes}>{children}</h1>;
};
