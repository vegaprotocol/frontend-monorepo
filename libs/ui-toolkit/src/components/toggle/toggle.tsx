import classnames from 'classnames';
import type { ChangeEvent } from 'react';

// Supports controlled and uncontrolled setups.
interface ToggleProps {
  label: string;
  value: string;
}

export interface ToggleInputProps {
  id?: string;
  name: string;
  toggles: ToggleProps[];
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  checkedValue?: string | undefined | null;
}

export const Toggle = ({
  id,
  name,
  toggles,
  className,
  onChange,
  checkedValue,
  ...props
}: ToggleInputProps) => {
  const fieldsetClasses = classnames(className, 'flex');
  const labelClasses = classnames(
    'group flex-1',
    '-ml-[1px] first-of-type:ml-0'
  );
  const radioClasses = classnames('sr-only', 'peer');
  const buttonClasses = classnames(
    'relative inline-block w-full',
    'border border-black-60 active:border-black dark:border-white-60 dark:active:border-white peer-checked:border-black dark:peer-checked:border-vega-yellow',
    'group-first-of-type:rounded-tl group-first-of-type:rounded-bl group-last-of-type:rounded-tr group-last-of-type:rounded-br',
    'px-28 py-4',
    'peer-checked:bg-vega-pink dark:peer-checked:bg-vega-yellow hover:bg-black-10 dark:hover:bg-white-25 hover:peer-checked:bg-vega-pink dark:hover:peer-checked:bg-vega-yellow focus-visible:bg-black-10 dark:focus-visible:bg-white-25',
    'text-ui text-center peer-checked:font-bold peer-checked:text-white dark:peer-checked:text-black text-black-60 dark:text-white-60 active:text-black dark:active:text-white focus-visible:text-black dark:focus-visible:text-white',
    'focus-within:shadow-inset-black',
    'cursor-pointer peer-checked:cursor-auto select-none transition-all duration-75'
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
