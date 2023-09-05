import { useState } from 'react';
import type { ComponentMeta } from '@storybook/react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Icon } from '../icon';

export default {
  title: 'DropdownMenu',
} as ComponentMeta<typeof DropdownMenu>;

export const CheckboxItems = () => {
  const checkboxItems = [
    { label: 'Bollinger bands', state: useState(false) },
    { label: 'Envelope', state: useState(true) },
    { label: 'EMA', state: useState(false) },
    { label: 'Moving average', state: useState(false) },
    { label: 'Price monitoring bands', state: useState(false) },
  ];
  console.log(checkboxItems);

  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger>
          <span>Select many things</span>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        {checkboxItems.map(({ label, state: [checked, setChecked] }) => (
          <DropdownMenuCheckboxItem
            key={label}
            checked={checked}
            onCheckedChange={(checked) =>
              setChecked(typeof checked === 'boolean' ? checked : false)
            }
          >
            {label}
            <DropdownMenuItemIndicator />
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const RadioItems = () => {
  const files = ['README.md', 'index.js', 'page.css'];
  const [selected, setSelected] = useState(files[1]);

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger>
            <span>Open</span>
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => console.log('minimize')}>
            Minimize window
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log('zoom')}>
            Zoom
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log('smaller')}>
            Smaller
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selected} onValueChange={setSelected}>
            {files.map((file) => (
              <DropdownMenuRadioItem key={file} value={file}>
                {file}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p>Selected file: {selected}</p>
    </div>
  );
};

export const IconMenu = () => {
  const iconMenuItems = [
    { label: 'IconMenu Item 1' },
    { label: 'IconMenu Item 2' },
  ];

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger>
            <Icon name="cog" />
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent>
          {iconMenuItems.map(({ label }) => (
            <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
