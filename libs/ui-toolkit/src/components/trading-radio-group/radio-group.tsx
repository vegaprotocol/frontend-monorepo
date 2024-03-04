import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { labelClasses } from '../checkbox';
import { CopyWithTooltip } from '../copy-with-tooltip';
import { VegaIcon, VegaIconNames } from '../icon';

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
  className?: string;
}

export const TradingRadio = ({
  id,
  value,
  label,
  disabled,
  className,
}: RadioProps) => {
  const wrapperClasses = classNames(
    'flex items-center gap-1.5 text-xs',
    labelClasses,
    className
  );
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
    <span className="inline-flex gap-2">
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
        <span
          className={
            disabled
              ? 'text-vega-clight-200 dark:text-vega-cdark-200'
              : 'cursor-pointer'
          }
        >
          {label}
        </span>
      </label>
      {value && value !== 'custom' && (
        <span className="text-muted">
          <CopyWithTooltip text={value}>
            <button>
              <VegaIcon name={VegaIconNames.COPY} />
            </button>
          </CopyWithTooltip>
        </span>
      )}
    </span>
  );
};
