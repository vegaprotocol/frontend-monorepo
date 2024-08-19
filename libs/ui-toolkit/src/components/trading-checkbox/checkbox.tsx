import { VegaIcon, VegaIconNames } from '../icon';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';
import { labelClasses } from '../checkbox';

type CheckedState = boolean | 'indeterminate';
export interface TradingCheckboxProps {
  checked?: CheckedState;
  label?: ReactNode;
  name?: string;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
}

export const TradingCheckbox = ({
  checked,
  label,
  name,
  onCheckedChange,
  disabled = false,
}: TradingCheckboxProps) => {
  const rootClasses = cn(
    'relative flex justify-center items-center w-3 h-3',
    'border rounded-sm overflow-hidden',
    'border-gs-300 dark:border-gs-700',
    'aria-checked:border-gs-400 aria-checked:dark:border-gs-600',
    'bg-surface-2 '
  );

  return (
    <label htmlFor={name} className={`flex gap-2 items-center ${labelClasses}`}>
      <CheckboxPrimitive.Root
        name={name}
        id={name}
        className={rootClasses}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-testid={name}
      >
        <CheckboxPrimitive.CheckboxIndicator className="flex justify-center items-center w-3 h-3">
          {checked === 'indeterminate' ? (
            <span
              data-testid="indeterminate-icon"
              className="absolute w-[8px] h-[2px] bg-surface-0-fg"
            />
          ) : (
            <VegaIcon name={VegaIconNames.TICK} size={10} />
          )}
        </CheckboxPrimitive.CheckboxIndicator>
      </CheckboxPrimitive.Root>
      <span
        className={cn('text-xs flex-1', {
          'text-surface-2-fg ': disabled,
        })}
      >
        {label}
      </span>
    </label>
  );
};
