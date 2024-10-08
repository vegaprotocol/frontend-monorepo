import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';
import { labelClasses } from '../checkbox';

export interface TradingRadioGroupProps {
  name?: string;
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  orientation?: 'horizontal' | 'vertical';
  onChange?: (value: string) => void;
  className?: string;
}

export const TradingRadioGroup = forwardRef<
  HTMLDivElement,
  TradingRadioGroupProps
>(
  (
    {
      children,
      name,
      value,
      orientation = 'vertical',
      onChange,
      className,
    }: TradingRadioGroupProps,
    ref
  ) => {
    const groupClasses = cn(
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
  className?: string;
}

export const TradingRadio = ({
  id,
  value,
  label,
  disabled,
  className,
}: RadioProps) => {
  const wrapperClasses = cn(
    'flex items-center gap-1.5 text-xs',
    labelClasses,
    className
  );
  const itemClasses = cn(
    'flex justify-center items-center',
    'w-3 h-3 rounded-full border',
    'border-gs-300 dark:border-gs-700',
    'aria-checked:border-gs-400 aria-checked:dark:border-gs-600',
    'bg-surface-2 '
  );
  const indicatorClasses = cn(
    'block w-2.5 h-2.5 border-2 rounded-full',
    'bg-gs-50',
    'border-gs-700 '
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
      <span className={disabled ? 'text-surface-2-fg ' : 'cursor-pointer'}>
        {label}
      </span>
    </label>
  );
};
