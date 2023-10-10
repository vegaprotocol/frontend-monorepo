import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { labelClasses } from '../checkbox';

export interface RadioGroupProps {
  name?: string;
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  orientation?: 'horizontal' | 'vertical';
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      children,
      name,
      value,
      orientation = 'vertical',
      onChange,
      className,
    }: RadioGroupProps,
    ref
  ) => {
    const groupClasses = classNames(
      'flex text-sm',
      {
        'flex-col gap-2': orientation === 'vertical',
        'flex-row gap-4': orientation === 'horizontal',
      },
      className
    );
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        name={name}
        value={value}
        onValueChange={onChange}
        orientation={orientation}
        className={groupClasses}
      >
        {children}
      </RadioGroupPrimitive.Root>
    );
  }
);

interface RadioProps {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

export const Radio = ({ id, value, label, disabled }: RadioProps) => {
  const wrapperClasses = classNames('flex items-center gap-2', labelClasses, {
    'opacity-40': disabled,
  });
  const itemClasses = classNames(
    'flex justify-center items-center',
    'w-[15px] h-[15px] rounded-full border',
    'border-neutral-300 dark:border-neutral-700',
    'bg-neutral-200 dark:bg-neutral-800'
  );
  const indicatorClasses = classNames(
    'block w-[13px] h-[13px] border-4 rounded-full',
    'bg-white dark:bg-black',
    'border-black dark:border-white'
  );
  return (
    <label className={wrapperClasses} htmlFor={id}>
      <RadioGroupPrimitive.Item
        value={value}
        className={itemClasses}
        id={id}
        data-testid={id}
        disabled={disabled}
      >
        <RadioGroupPrimitive.Indicator className={indicatorClasses} />
      </RadioGroupPrimitive.Item>
      <span className={disabled ? '' : 'cursor-pointer'}>{label}</span>
    </label>
  );
};
