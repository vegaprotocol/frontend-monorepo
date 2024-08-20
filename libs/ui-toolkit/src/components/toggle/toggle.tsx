import { cn } from '../../utils/cn';
import type { ChangeEvent } from 'react';

// Supports controlled and uncontrolled setups.
interface ToggleInput {
  label: string;
  value: string;
}

export interface ToggleProps {
  id?: string;
  name: string;
  toggles: ToggleInput[];
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  checkedValue?: string | undefined | null;
  type?: 'primary' | 'buy' | 'sell';
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle = ({
  id,
  name,
  toggles,
  onChange,
  checkedValue,
  type = 'primary',
  size = 'lg',
  ...props
}: ToggleProps) => {
  const fieldsetClasses = 'flex rounded-full bg-surface-3 text-sm';
  const labelClasses = cn('group flex-1', '-ml-[1px] first-of-type:ml-0');
  const radioClasses = cn('sr-only', 'peer');
  const buttonClasses = cn(
    'relative inline-flex w-full h-full text-center items-center justify-center',
    'peer-checked:rounded-full',
    {
      'peer-checked:bg-gs-900 peer-checked:text-surface-1-fg peer-checked:dark:bg-gs-100 peer-checked:dark:text-gs-900':
        type === 'primary',
      'peer-checked:bg-market-green-550 peer-checked:text-white':
        type === 'buy',
      'peer-checked:bg-market-red peer-checked:text-white': type === 'sell',
    },
    'cursor-pointer peer-checked:cursor-auto select-none',
    {
      'px-10 py-2': size === 'lg',
      'px-8 py-2': size === 'md',
      'px-6 py-2': size === 'sm',
    },
    'peer-focus:outline peer-focus:outline-2 peer-focus:outline-blue-700 dark:peer-focus:outline-blue-300 peer-focus:outline-offset-2'
  );

  return (
    <fieldset className={fieldsetClasses} {...props}>
      {toggles.map(({ label, value }, key) => {
        return (
          <label
            key={key}
            className={labelClasses}
            htmlFor={label}
            data-testid={`${name}-${value}`}
          >
            <input
              type="radio"
              id={label}
              name={name}
              value={value}
              onChange={onChange}
              checked={
                checkedValue === undefined ? undefined : value === checkedValue
              }
              className={radioClasses}
            />
            <span className={buttonClasses}>
              <span>{label}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
};
