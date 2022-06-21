import * as React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement | ReactElement[];
}

export const DrawerWrapper = ({ children }: Props) => {
  const classes = classNames('flex dark:bg-black md:flex-row');

  return <div className={classes}>{children}</div>;
};
