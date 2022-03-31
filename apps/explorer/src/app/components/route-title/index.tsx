import classnames from 'classnames';
import type { HTMLAttributes } from 'react';
import React from 'react';

interface RouteTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const RouteTitle = ({
  children,
  className,
  ...props
}: RouteTitleProps) => {
  const classes = classnames(
    'font-alpha',
    'text-h3',
    'uppercase',
    'mt-12',
    'mb-28',
    className
  );
  return (
    <h1 className={classes} {...props}>
      {children}
    </h1>
  );
};
