import { cn } from './cn';

export const defaultSelectElement = (hasError?: boolean) =>
  cn(defaultFormElement(hasError), 'pr-10 min-h-8 py-1');

export const defaultFormElement = (hasError?: boolean) =>
  cn(
    'flex items-center w-full text-sm',
    'p-2 rounded whitespace-nowrap text-ellipsis overflow-hidden disabled:opacity-40',
    {
      'bg-surface-2 ': !hasError,
      'bg-transparent': hasError,
      'border-vega-red-500': hasError,
      'border-gs-300 dark:border-gs-700 ': !hasError,
    }
  );
