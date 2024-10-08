import { Icon } from '../icon';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../utils/cn';
import { type ElementRef, forwardRef, type ReactNode } from 'react';

type CheckedState = boolean | 'indeterminate';
export const labelClasses =
  "relative before:content-[''] before:block before:absolute before:top-1/2	before:left-[0] before:right-[0] before:-translate-y-1/2 before:h-6";
export interface CheckboxProps {
  checked?: CheckedState;
  label?: ReactNode;
  name?: string;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
}

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ checked, label, name, onCheckedChange, disabled = false }, ref) => {
  const rootClasses = cn(
    'relative flex justify-center items-center w-[15px] h-[15px] mt-1',
    'border rounded-sm overflow-hidden',
    {
      'opacity-40 cursor-default': disabled,
      'border-gs-600 bg-surface-2': !checked,
      'border-surface-0': checked,
    }
  );

  return (
    <label className={`flex gap-1 ${labelClasses}`} htmlFor={name}>
      <CheckboxPrimitive.Root
        ref={ref}
        name={name}
        id={name}
        className={rootClasses}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-testid={name}
      >
        <CheckboxPrimitive.CheckboxIndicator className="flex justify-center items-center w-[15px] h-[15px] bg-surface-0">
          {checked === 'indeterminate' ? (
            <span
              data-testid="indeterminate-icon"
              className="absolute w-[8px] h-[2px] bg-surface-2"
            />
          ) : (
            <Icon
              name="tick"
              size={3}
              className="relative text-white dark:text-black"
            />
          )}
        </CheckboxPrimitive.CheckboxIndicator>
      </CheckboxPrimitive.Root>
      <span
        className={cn('text-sm flex-1', {
          'text-surface-1-fg': disabled,
        })}
      >
        {label}
      </span>
    </label>
  );
});
