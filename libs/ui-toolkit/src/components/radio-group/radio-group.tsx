import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';

interface RadioGroupProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const RadioGroup = ({ children, onChange }: RadioGroupProps) => {
  return (
    <RadioGroupPrimitive.Root
      onValueChange={onChange}
      className="flex flex-row gap-24"
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
};

interface RadioProps {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
  hasError?: boolean;
}

export const Radio = ({ id, value, label, disabled, hasError }: RadioProps) => {
  const wrapperClasses = classNames('flex flex-row gap-8 items-center', {
    'opacity-50': disabled,
  });
  const itemClasses = classNames(
    'flex justify-center items-center',
    'w-[17px] h-[17px] rounded-full border',
    'focus:outline-0 focus-visible:outline-0',
    'focus:shadow-radio focus:shadow-vega-pink dark:focus:shadow-vega-yellow',
    'border-black dark:border-white',
    {
      'border-black dark:border-white': !hasError,
      'border-intent-danger dark:border-intent-danger': hasError,
    }
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
        <RadioGroupPrimitive.Indicator className="w-[7px] h-[7px] bg-vega-pink dark:bg-vega-yellow rounded-full" />
      </RadioGroupPrimitive.Item>
      <label htmlFor={id} className={disabled ? '' : 'cursor-pointer'}>
        {label}
      </label>
    </div>
  );
};
