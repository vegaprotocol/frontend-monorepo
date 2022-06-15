import classnames from 'classnames';
import { Icon } from '../icon';
import type { ChangeEvent, InputHTMLAttributes } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  state?: 'checked' | 'unchecked' | 'indeterminate';
  error?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = ({
  label,
  className,
  state,
  error,
  onChange,
  ...props
}: CheckboxProps) => {
  const containerClasses = classnames(
    className,
    'grid grid-cols-[auto_1fr] select-none'
  );
  const inputClasses = 'sr-only peer';
  const vegaCheckboxClasses = classnames(
    'col-start-1 row-start-1',
    'inline-block w-20 h-20 relative z-0',
    'shadow-input dark:shadow-input-dark bg-white dark:bg-white-25',
    'focus-visible:outline-none focus-visible:shadow-checkbox-focus dark:focus-visible:shadow-checkbox-focus-dark',
    'cursor-pointer peer-disabled:cursor-default',
    {
      'input-border dark:input-border-dark': !error,
      'border border-vega-red': error,
    }
  );
  // In uncontrolled elements without state, we apply the hidden class and 'peer-checked' can
  // override it as necessary. At other times, we control display properties via state conditions.
  const iconClasses = classnames(
    'col-start-1 row-start-1 place-self-center relative z-50 pointer-events-none',
    {
      hidden: !state || state === 'unchecked',
    }
  );
  const tickClasses = classnames(iconClasses, {
    'peer-checked:block': !state,
    block: state === 'checked',
    hidden: state === 'indeterminate',
  });
  const minusClasses = classnames(iconClasses, {
    block: state === 'indeterminate',
    hidden: state === 'checked',
  });
  const labelClasses = classnames(
    'col-start-2 row-start-1 pl-8 cursor-pointer peer-disabled:cursor-default'
  );

  return (
    <label
      className={containerClasses}
      data-testid={`checkbox${error ? '-error' : ''}${
        state ? `-${state}` : ''
      }`}
    >
      <input
        type="checkbox"
        className={inputClasses}
        onChange={onChange}
        {...props}
      />
      <span className={vegaCheckboxClasses} />
      <span className={tickClasses}>
        <Icon name={'tick'} className="fill-vega-pink dark:fill-vega-yellow" />
      </span>
      <span className={minusClasses}>
        <Icon name={'minus'} className="fill-vega-pink dark:fill-vega-yellow" />
      </span>
      <span className={labelClasses}>{label}</span>
    </label>
  );
};
