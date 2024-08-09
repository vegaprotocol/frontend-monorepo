import { VegaIcon, VegaIconNames } from '../icon';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@vegaprotocol/utils';
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
    'border-gs-500 ',
    'aria-checked:border-gs-400',
    'disabled:border-gs-600',
    'bg-gs-700 '
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
              className="absolute w-[8px] h-[2px] bg-gs-50"
            />
          ) : (
            <VegaIcon name={VegaIconNames.TICK} size={10} />
          )}
        </CheckboxPrimitive.CheckboxIndicator>
      </CheckboxPrimitive.Root>
      <span
        className={cn('text-xs flex-1', {
          'text-gs-200 ': disabled,
        })}
      >
        {label}
      </span>
    </label>
  );
};
