import type { ComponentMeta } from '@storybook/react';

import {
  NavDropdownMenu,
  NavDropdownMenuContent,
  NavDropdownMenuItem,
  NavDropdownMenuTrigger,
} from './dropdown-menu';

export default {
  title: 'NavDropdownMenu',
} as ComponentMeta<typeof NavDropdownMenu>;

export const RadioItems = () => {
  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <NavDropdownMenu>
        <NavDropdownMenuTrigger>
          <span>Open</span>
        </NavDropdownMenuTrigger>
        <NavDropdownMenuContent>
          <NavDropdownMenuItem onSelect={() => console.log('minimize')}>
            Minimize window
          </NavDropdownMenuItem>
          <NavDropdownMenuItem onSelect={() => console.log('zoom')}>
            Zoom
          </NavDropdownMenuItem>
          <NavDropdownMenuItem onSelect={() => console.log('smaller')}>
            Smaller
          </NavDropdownMenuItem>
        </NavDropdownMenuContent>
      </NavDropdownMenu>
    </div>
  );
};
