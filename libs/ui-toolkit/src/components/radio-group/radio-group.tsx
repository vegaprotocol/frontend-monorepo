import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';

interface RadioGroupProps {
  name?: string;
  children: ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const RadioGroup = ({
  children,
  name,
  value,
  className,
  onChange,
}: RadioGroupProps) => {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      value={value}
      onValueChange={onChange}
      className={classNames('flex flex-row gap-24', className)}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
};

interface RadioProps {
  id: string;
  value: string;
  label: string;
  labelClassName?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export const Radio = ({
  id,
  value,
  label,
  labelClassName,
  disabled,
  hasError,
}: RadioProps) => {
  const wrapperClasses = classNames('relative pl-[25px]', {
    'opacity-50': disabled,
  });
  const itemClasses = classNames(
    'flex justify-center items-center',
    // 'absolute top-0 left-0',
    'w-[17px] h-[17px] rounded-full border',
    'focus:outline-none focus-visible:outline-none',
    'focus-visible:shadow-vega-pink dark:focus-visible:shadow-vega-yellow',
    'dark:bg-white-25',
    labelClassName,
    {
      'border-black-60 dark:border-white-60': !hasError,
      'border-danger dark:border-danger': hasError,
    }
  );
  return (
    <div className={wrapperClasses}>
      <RadioGroupPrimitive.Item
        value={value}
        className="absolute h-full w-[25px] top-0 left-0"
        id={id}
        data-testid={id}
        disabled={disabled}
      >
        <div className={itemClasses}>
          <RadioGroupPrimitive.Indicator className="w-[7px] h-[7px] bg-vega-pink dark:bg-vega-yellow rounded-full" />
        </div>
      </RadioGroupPrimitive.Item>
      <label htmlFor={id} className={disabled ? '' : 'cursor-pointer'}>
        {label}
      </label>
    </div>
  );
};
