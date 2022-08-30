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
}

export const Toggle = ({
  id,
  name,
  toggles,
  onChange,
  checkedValue,
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
    'peer-checked:bg-neutral-400 dark:peer-checked:bg-white',
    'peer-checked:text-white dark:peer-checked:text-black',
    'cursor-pointer peer-checked:cursor-auto select-none'
  );

  return (
    <fieldset className={fieldsetClasses} {...props}>
      {toggles.map(({ label, value }, key) => {
        const isSelected = value === checkedValue;
        return (
          <label key={key} className={labelClasses} htmlFor={label}>
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
            <span
              className={buttonClasses}
              data-testid={
                isSelected ? `${name}-${value}-selected` : `${name}-${value}`
              }
            >
              {label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
};
