import * as React from 'react';
import type { ReactElement } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { ButtonProps } from '@vegaprotocol/ui-toolkit';

type MenuItem = {
  label: string;
  component: ReactElement | ReactElement[];
  onClick(): void;
  active: boolean;
};

interface Props {
  /**
   * Menu items passed as an array
   */
  menuItems: MenuItem[];
}

export const NavigationDrawerMenu = ({ menuItems }: Props) => {
  return (
    <ul>
      {menuItems.map((item, index) => {
        const btnProps = {
          variant: item.active ? 'accent' : 'primary',
          className: 'w-full mb-8',
          onClick: item.onClick,
        } as ButtonProps;

        return (
          <li key={index}>
            <Button {...btnProps}>{item.label}</Button>
          </li>
        );
      })}
    </ul>
  );
};
