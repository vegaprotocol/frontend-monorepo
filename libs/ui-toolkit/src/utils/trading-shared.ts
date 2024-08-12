import { cn } from './cn';

export const defaultSelectElement = (hasError?: boolean, disabled?: boolean) =>
  cn(defaultFormElement(hasError, disabled), 'pr-10 min-h-8 py-1');

export const defaultFormElement = (hasError?: boolean, disabled?: boolean) =>
  cn(
    'flex items-center w-full text-sm',
    'p-2 rounded whitespace-nowrap text-ellipsis overflow-hidden',
    {
      'bg-gs-700 ': !disabled && !hasError,
      'bg-transparent': disabled || hasError,
      'border-gs-600 ': disabled,
      'border-vega-red-500': !disabled && hasError,
      'border-gs-500 ': !disabled && !hasError,
    }
  );
