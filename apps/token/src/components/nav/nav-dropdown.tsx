import { useState } from 'react';
import Routes, { TOKEN_DROPDOWN_ROUTES } from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import type { NavbarTheme } from './nav-link';
import { AppNavLink } from './nav-link';
import {
  NavDropdownMenu,
  NavDropdownMenuContent,
  NavDropdownMenuItem,
  NavDropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';

export const NavDropDown = ({ navbarTheme }: { navbarTheme: NavbarTheme }) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  return (
    <NavDropdownMenu open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <AppNavLink
        name={
          <NavDropdownMenuTrigger
            className="w-auto flex items-center"
            data-testid="state-trigger"
            onClick={() => setOpen(!isOpen)}
          >
            {t('Token')}
          </NavDropdownMenuTrigger>
        }
        testId="token-dd"
        path={Routes.TOKEN}
        navbarTheme={navbarTheme}
      />

      <NavDropdownMenuContent data-testid="token-dropdown">
        {TOKEN_DROPDOWN_ROUTES.map((r) => (
          <NavDropdownMenuItem key={r.name} onClick={() => setOpen(false)}>
            <AppNavLink
              testId={r.name}
              name={t(r.name)}
              path={r.path}
              navbarTheme={'inherit'}
              subNav={true}
              end={true}
              fullWidth={true}
            />
          </NavDropdownMenuItem>
        ))}
      </NavDropdownMenuContent>
    </NavDropdownMenu>
  );
};
