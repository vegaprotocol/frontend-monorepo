import { cn } from './cn';

export const defaultSelectElement = (hasError?: boolean) =>
  cn(defaultFormElement(hasError), 'pr-10 h-10 py-1');

export const defaultFormElement = (hasError?: boolean) =>
  cn(
    'flex items-center w-full text-sm',
    'p-2 rounded-input border whitespace-nowrap text-ellipsis overflow-hidden disabled:opacity-40',
    {
      'bg-surface-2': !hasError,
      'border-danger': hasError,
    }
  );
