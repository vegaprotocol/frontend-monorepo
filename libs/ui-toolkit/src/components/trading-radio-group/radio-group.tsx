import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';

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

export const TradingRadio = ({ id, value, label, disabled }: RadioProps) => {
  const wrapperClasses = classNames('flex items-center gap-1.5 text-xs');
  const itemClasses = classNames(
    'flex justify-center items-center',
    'w-3 h-3 rounded-full border',
    'border-vega-clight-500 dark:border-vega-cdark-500',
    'aria-checked:border-vega-clight-400 dark:aria-checked:border-vega-cdark-400',
    'disabled:border-vega-clight-600 dark:disabled:border-vega-cdark-600',
    'bg-vega-clight-700 dark:bg-vega-cdark-700'
  );
  const indicatorClasses = classNames(
    'block w-2.5 h-2.5 border-2 rounded-full',
    'bg-vega-clight-50 dark:bg-vega-cdark-50',
    'border-vega-clight-700 dark:border-vega-cdark-700'
  );
  return (
    <div className={wrapperClasses}>
      <RadioGroupPrimitive.Item
        value={value}
        className={itemClasses}
        id={id}
        data-testid={id}
        disabled={disabled}
      >
        <RadioGroupPrimitive.Indicator className={indicatorClasses} />
      </RadioGroupPrimitive.Item>
      <label
        htmlFor={id}
        className={
          disabled
            ? 'text-vega-clight-200 dark:text-vega-cdark-200'
            : 'cursor-pointer'
        }
      >
        {label}
      </label>
    </div>
  );
};
