import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Icon } from '../icon';
import classnames from 'classnames';

const sharedTriggerAndItemClasses = classnames(
  'flex justify-between',
  'py-8 px-12',
  'text-ui font-sans'
);
const sharedTriggerAndContentClasses = classnames(
  'w-full',
  'text-left',
  'border rounded-none',
  'focus-visible:outline-none',
  'text-black dark:text-white',
  'bg-white dark:bg-white-25',
  {}
);

type SelectProps = React.ComponentProps<typeof SelectPrimitive.Select> & {
  hasError?: boolean;
  disabled?: boolean;
};

export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Select>,
  SelectProps
>(({ children, hasError, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        ref={forwardedRef}
        className={classnames(
          sharedTriggerAndItemClasses,
          sharedTriggerAndContentClasses,
          {
            'border-black dark:border-white': !hasError,
            'focus:inset-shadow-vega-yellow dark:focus:inset-shadow-vega-pink':
              !hasError,
            'focus-visible:inset-shadow-vega-yellow dark:focus-visible:inset-shadow-vega-pink':
              !hasError,
            'focus:inset-shadow-danger focus-visible:inset-shadow-danger':
              hasError,
            'border-danger': hasError,
          }
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <Icon name="chevron-down" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content
        className={classnames(sharedTriggerAndContentClasses, {
          'inset-shadow-vega-pink dark:inset-shadow-vega-yellow': !hasError,
          'inset-shadow-danger': hasError,
        })}
      >
        <SelectPrimitive.ScrollUpButton>
          <Icon name="chevron-up" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton>
          <Icon name="chevron-down" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
});

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.SelectItem>,
  React.ComponentProps<typeof SelectPrimitive.SelectItem>
>(({ children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Item
      {...props}
      ref={forwardedRef}
      className={classnames(
        sharedTriggerAndItemClasses,
        'select-none',
        'hover:outline-none',
        'focus:outline-none',
        {
          'hover:bg-vega-pink hover:text-white dark:hover:bg-vega-yellow dark:hover:text-black hover:cursor-pointer':
            !props.disabled,
          'focus:bg-vega-pink focus:text-white dark:focus:bg-vega-yellow dark:focus:text-black':
            !props.disabled,
          'hover:bg-black-10': props.disabled,
          'focus:bg-black-10': props.disabled,
        }
      )}
    >
      <SelectPrimitive.ItemText className="select-none">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Icon name="tick" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});
