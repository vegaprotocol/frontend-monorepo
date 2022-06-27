import * as React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement | ReactElement[];
  className?: string;
}

export const DrawerWrapper = ({ children, className = '' }: Props) => {
  const classes = classNames('flex dark:bg-black md:flex-row', className);
  return <div className={classes}>{children}</div>;
};
