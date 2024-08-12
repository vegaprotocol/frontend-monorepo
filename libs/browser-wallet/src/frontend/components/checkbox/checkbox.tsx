import { Checkbox as UICheckbox } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import locators from '../locators';

export type CheckboxProperties<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function Checkbox<T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
}: CheckboxProperties<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <div
            data-testid={locators.checkboxWrapper}
            className={cn('mt-4 flex items-center gap-4', className)}
          >
            <UICheckbox
              label={label}
              checked={!!field.value}
              disabled={disabled}
              onCheckedChange={field.onChange}
              name={name}
            />
          </div>
        );
      }}
    />
  );
}
