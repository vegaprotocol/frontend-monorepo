import { Icon } from '../icon';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import classNames from 'classnames';

type CheckedState = boolean | 'indeterminate';
export interface CheckboxProps {
  checked: CheckedState;
  label?: string;
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
    'flex justify-center items-center w-[15px] h-[15px] rounded-sm',
    'border overflow-hidden',
    {
      'opacity-40 cursor-default': disabled,
      'border-neutral-700 dark:border-neutral-300': !checked,
      'border-white dark:border-black': checked,
    }
  );
  return (
    <div className="flex gap-2 items-center">
      <CheckboxPrimitive.Root
        name={name}
        id={name}
        className={rootClasses}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <CheckboxPrimitive.CheckboxIndicator className="w-[15px] h-[15px] bg-black dark:bg-white">
          <Icon
            name="tick"
            className="relative top-[-5px] w-[11px] h-[11px] text-white dark:text-black"
          />
        </CheckboxPrimitive.CheckboxIndicator>
      </CheckboxPrimitive.Root>
      <label htmlFor={name} className="text-sm">
        {label}
      </label>
    </div>
  );
};
