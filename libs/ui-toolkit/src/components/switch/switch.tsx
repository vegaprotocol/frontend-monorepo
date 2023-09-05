import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import * as RootSwitch from '@radix-ui/react-switch';

export interface SwitchProps {
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  disabled?: boolean;
  labelText?: ReactNode | string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { name = 'switch', labelText, onCheckedChange, checked = false, disabled },
    ref
  ) => {
    return (
      <div className="flex items-center justify-start">
        <RootSwitch.Root
          className="w-[41px] h-[18px] rounded bg-vega-light-200 dark:bg-neutral-700 rounded-full relative data-[state=checked]:bg-vega-light-200 dark:data-[state=checked]:bg-neutral-700 outline-none cursor-default"
          id={`switch-${name}`}
          onCheckedChange={onCheckedChange}
          checked={checked}
          disabled={disabled}
          ref={ref}
        >
          <RootSwitch.Thumb className="block w-[18px] h-[18px] bg-black dark:bg-white rounded-full transition-transform duration-100 translate-x-0.3 will-change-transform data-[state=checked]:translate-x-[23px]" />
        </RootSwitch.Root>
        {labelText && (
          <label htmlFor={`switch-${name}`} className="ml-2">
            {labelText}
          </label>
        )}
      </div>
    );
  }
);
