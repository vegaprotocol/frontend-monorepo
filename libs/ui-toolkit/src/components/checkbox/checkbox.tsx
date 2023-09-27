import { Icon } from '../icon';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './checkbox.module.css';

type CheckedState = boolean | 'indeterminate';
export interface CheckboxProps {
  checked?: CheckedState;
  label?: ReactNode;
  name?: string;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
}

export const Checkbox = ({
  checked,
  label,
  name,
  onCheckedChange,
  disabled = false,
}: CheckboxProps) => {
  const rootClasses = classNames(
    'relative flex justify-center items-center w-[15px] h-[15px] mt-1',
    'border rounded-sm overflow-hidden',
    {
      'opacity-40 cursor-default': disabled,
      'border-neutral-700 dark:border-neutral-300': !checked,
      'border-white dark:border-black': checked,
    }
  );

  return (
    <label className={`flex gap-1 ${styles['label']}`} htmlFor={name}>
      <CheckboxPrimitive.Root
        name={name}
        id={name}
        className={rootClasses}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-testid={name}
      >
        <CheckboxPrimitive.CheckboxIndicator className="flex justify-center items-center w-[15px] h-[15px] bg-black dark:bg-white">
          {checked === 'indeterminate' ? (
            <span
              data-testid="indeterminate-icon"
              className="absolute w-[8px] h-[2px] bg-white dark:bg-black"
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
        className={classNames('text-sm flex-1', {
          'dark:text-neutral-400 text-neutral-600': disabled,
        })}
      >
        {label}
      </span>
    </label>
  );
};
