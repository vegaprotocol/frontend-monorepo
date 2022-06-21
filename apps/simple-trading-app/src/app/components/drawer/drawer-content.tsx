import * as React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement | ReactElement[];
  className?: string;
}

export const DrawerContent = ({ children, className = '' }: Props) => {
  const classes = classNames('w-full sm:w-full grow-1', {
    [className]: className,
  });

  return <div className={classes}>{children}</div>;
};
