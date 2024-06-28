import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import * as RootSwitch from '@radix-ui/react-switch';
import classNames from 'classnames';

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
    const wrapperClasses = classNames(
      'rounded-full relative outline-none cursor-default',
      'w-[41px] h-[18px]',
      'bg-vega-clight-500 dark:bg-vega-cdark-500',
      'data-[state=checked]:bg-vega-clight-300 dark:data-[state=checked]:bg-vega-cdark-300'
    );

    const thumbClasses = classNames(
      'cursor-pointer',
      'block w-[18px] h-[18px]',
      'bg-vega-clight-50 dark:bg-vega-cdark-50',
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
