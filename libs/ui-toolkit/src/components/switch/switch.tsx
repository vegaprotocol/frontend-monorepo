import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import * as RootSwitch from '@radix-ui/react-switch';
import { cn } from '@vegaprotocol/ui-toolkit';

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
    const wrapperClasses = cn(
      'rounded-full relative outline-none cursor-default',
      'w-[41px] h-[18px]',
      'bg-gs-500 ',
      'data-[state=checked]:bg-gs-300'
    );

    const thumbClasses = cn(
      'cursor-pointer',
      'block w-[18px] h-[18px]',
      'bg-gs-50',
      'rounded-full transition-transform duration-100 translate-x-0.3 will-change-transform',
      'data-[state=checked]:translate-x-[23px]'
    );

    return (
      <div className="flex items-center justify-start">
        <RootSwitch.Root
          className={wrapperClasses}
          id={`switch-${name}`}
          onCheckedChange={onCheckedChange}
          checked={checked}
          disabled={disabled}
          ref={ref}
        >
          <RootSwitch.Thumb className={thumbClasses} />
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
