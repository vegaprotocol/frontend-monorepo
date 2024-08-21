import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { To } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import { FULL_ROUTES } from '../../routes/route-names';
import { LeftRightArrows } from '../icons/left-right-arrows';
import { Settings } from '../icons/settings';
import { Wallet } from '../icons/wallet';
import locators from '../locators';

export interface NavButtonProperties {
  icon: ReactNode;
  text: string;
  to: To;
}

export const NavButton = ({ icon, text, to }: NavButtonProperties) => {
  return (
    <NavLink data-testid={locators.navButton} to={to} className="text-center">
      {({ isActive }) => {
        const textColor = isActive ? 'text-surface-0-fg' : 'text-neutral-600';

        return (
          <div className="h-full grid gap-0 grid-rows-[1fr_auto_auto]">
            <div className={cn('grid items-center mt-5', textColor)}>
              {icon}
            </div>
            <span className={cn('mt-2 text-xs', textColor)}>{text}</span>
            <div
              data-testid={locators.linkActive}
              className={cn('h-1 w-full mt-2', {
                'bg-intent-primary text-intent-primary-foreground': isActive,
              })}
            />
          </div>
        );
      }}
    </NavLink>
  );
};

export const NavBar = () => {
  return (
    <nav
      data-testid={locators.navBar}
      className={
        'z-[5] w-full h-20 grid gap-0 grid-cols-3 border-t border-vega-dark-200 bg-surface-1 text-surface-1-fg'
      }
    >
      <NavButton
        icon={<Wallet className="m-auto" squareFill={'black'} />}
        to={{ pathname: FULL_ROUTES.wallets }}
        text="Wallets"
      />
      <NavButton
        icon={<LeftRightArrows className="m-auto" />}
        to={{ pathname: FULL_ROUTES.transactions }}
        text="Transactions"
      />
      <NavButton
        icon={<Settings className="m-auto" />}
        to={{ pathname: FULL_ROUTES.settings }}
        text="Settings"
      />
    </nav>
  );
};
