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

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <DropdownMenu>
        <DropdownMenuTrigger name="Select many things" className="w-[300px]" />
        <DropdownMenuContent className="w-[300px]">
          {checkboxItems.map(({ label, state: [checked, setChecked] }) => (
            <DropdownMenuCheckboxItem
              key={label}
              checked={checked}
              onCheckedChange={setChecked}
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const RadioItems = () => {
  const files = ['README.md', 'index.js', 'page.css'];
  const [file, setFile] = useState(files[1]);

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <DropdownMenu>
        <DropdownMenuTrigger name="Open" />
        <DropdownMenuContent>
          <DropdownMenuItem inset onSelect={() => console.log('minimize')}>
            Minimize window
          </DropdownMenuItem>
          <DropdownMenuItem inset onSelect={() => console.log('zoom')}>
            Zoom
          </DropdownMenuItem>
          <DropdownMenuItem inset onSelect={() => console.log('smaller')}>
            Smaller
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={file} onValueChange={setFile}>
            {files.map((file) => (
              <DropdownMenuRadioItem key={file} inset value={file}>
                {file}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p>Selected file: {file}</p>
    </div>
  );
};
