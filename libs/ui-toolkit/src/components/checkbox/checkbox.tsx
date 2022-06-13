import classnames from 'classnames';
import { Icon } from '../icon';
import type { ChangeEvent } from 'react';

export interface CheckboxProps {
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
}: CheckboxProps) => {
  const containerClasses = classnames(
    className,
    'grid grid-cols-[auto_1fr] gap-8 select-none cursor-pointer'
  );
  const inputClasses = 'sr-only peer';
  const vegaCheckboxClasses = classnames(
    'col-start-1 row-start-1',
    'inline-block w-20 h-20 relative z-0',
    'input-shadow bg-white dark:bg-white-25',
    'focus-visible:outline-none focus-visible:checkbox-focus-shadow dark:focus-visible:checkbox-focus-shadow-dark',
    {
      'input-border dark:dark-input-border': !error,
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
  const labelClasses = classnames('col-start-2 row-start-1');

  return (
    <label
      className={containerClasses}
      data-testid={`checkbox${error ? '-error' : ''}${
        state ? `-${state}` : ''
      }`}
    >
      <input type="checkbox" className={inputClasses} onChange={onChange} />
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
