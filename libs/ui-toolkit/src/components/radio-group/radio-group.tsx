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

interface RadioItemProps {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

export const RadioItem = ({ id, value, label, disabled }: RadioItemProps) => {
  const wrapperClasses = classNames('flex flex-row gap-12 items-center', {
    'opacity-75': disabled,
  });
  const itemClasses = classNames(
    'flex justify-center items-center',
    'w-24 h-24 rounded-full border',
    'border-black dark:border-white'
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
        <RadioGroupPrimitive.Indicator className="w-12 h-12 bg-black dark:bg-white rounded-full" />
      </RadioGroupPrimitive.Item>
      <label htmlFor={id} className={disabled ? '' : 'cursor-pointer'}>
        {label}
      </label>
    </div>
  );
};
