import classnames from 'classnames';
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
}

export const Toggle = ({
  id,
  name,
  toggles,
  onChange,
  checkedValue,
  type = 'primary',
  ...props
}: ToggleProps) => {
  const fieldsetClasses =
    'flex rounded-full bg-neutral-100 dark:bg-neutral-700 text-sm';
  const labelClasses = classnames(
    'group flex-1',
    '-ml-[1px] first-of-type:ml-0'
  );
  const radioClasses = classnames('sr-only', 'peer');
  const buttonClasses = classnames(
    'relative inline-block w-full text-center',
    'peer-checked:rounded-full',
    'px-10 py-2',
    {
      'peer-checked:bg-neutral-400 dark:peer-checked:bg-white dark:peer-checked:text-black':
        type === 'primary',
      'dark:peer-checked:bg-vega-green peer-checked:bg-vega-green-dark':
        type === 'buy',
      'dark:peer-checked:bg-vega-pink peer-checked:bg-vega-pink-dark':
        type === 'sell',
    },
    'peer-checked:text-white dark:peer-checked:text-black',
    'cursor-pointer peer-checked:cursor-auto select-none'
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
            <span className={buttonClasses}>{label}</span>
          </label>
        );
      })}
    </fieldset>
  );
};
