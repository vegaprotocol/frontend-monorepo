import { Icon } from '../icon';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import classNames from 'classnames';
import type { ReactNode } from 'react';

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
  const rootClasses = classNames(
    'relative flex justify-center items-center w-3 h-3',
    'border rounded-sm overflow-hidden',
    'border-vega-clight-500 dark:border-vega-cdark-500',
    'aria-checked:border-vega-clight-400 dark:aria-checked:border-vega-cdark-400',
    'disabled:border-vega-clight-600 dark:disabled:border-vega-cdark-600',
    'bg-vega-clight-700 dark:bg-vega-cdark-700'
  );

  return (
    <div className="flex gap-1.5 items-center">
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
              className="absolute w-[8px] h-[2px] bg-vega-clight-50 dark:bg-vega-cdark-50"
            />
          ) : (
            <Icon
              name="tick"
              size={2}
              className="relative text-vega-clight-50 dark:text-vega-cdark-50"
            />
          )}
        </CheckboxPrimitive.CheckboxIndicator>
      </CheckboxPrimitive.Root>
      <label
        htmlFor={name}
        className={classNames('text-xs flex-1', {
          'text-vega-clight-200 dark:text-vega-cdark-200': disabled,
        })}
      >
        {label}
      </label>
    </div>
  );
};
