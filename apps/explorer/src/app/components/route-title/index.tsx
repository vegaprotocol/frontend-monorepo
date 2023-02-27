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
    'font-alpha calt',
    'text-4xl',
    'uppercase',
    'mb-8',
    className
  );
  return (
    <h1 className={classes} {...props}>
      {children}
    </h1>
  );
};
