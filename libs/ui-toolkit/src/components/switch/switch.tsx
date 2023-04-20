import type { ReactNode } from 'react';
import * as RootSwitch from '@radix-ui/react-switch';
import { forwardRef } from 'react';
interface SwitchProps {
  name: string;
  labelText?: ReactNode | string;
  onCheckedChange?: () => void;
  checked?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ name, labelText, onCheckedChange, checked }, ref) => {
    return (
      <div className="flex items-center justify-between">
        <RootSwitch.Root
          className="w-[41px] h-[18px] rounded bg-neutral-400 dark:bg-neutral-700 rounded-full relative ---data-[state=checked]:bg-black outline-none cursor-default"
          id={`switch-${name}`}
          onCheckedChange={onCheckedChange}
          checked={checked}
          ref={ref}
        >
          <RootSwitch.Thumb className="block w-[18px] h-[18px] bg-white rounded-full transition-transform duration-100 translate-x-0.3 will-change-transform data-[state=checked]:translate-x-[23px]" />
        </RootSwitch.Root>
        {labelText && (
          <label className="Label" htmlFor={`switch-${name}`}>
            {labelText}
          </label>
        )}
      </div>
    );
  }
);
