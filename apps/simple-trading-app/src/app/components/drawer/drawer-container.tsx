import * as React from 'react';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement | ReactElement[];
}

export const DrawerContainer = ({ children }: Props) => (
  <div className="w-full md:w-3/4 grow-1">{children}</div>
);

export const DrawerWrapper = ({ children }: Props) => (
  <div className="flex">{children}</div>
);
