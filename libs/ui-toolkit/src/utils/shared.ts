import classnames from 'classnames';

export const defaultSelectElement = (hasError?: boolean, disabled?: boolean) =>
  classnames(defaultFormElement(hasError, disabled), 'pr-10 min-h-8 py-1');

export const defaultFormElement = (hasError?: boolean, disabled?: boolean) =>
  classnames(
    'flex items-center w-full text-sm',
    'p-2 rounded whitespace-nowrap text-ellipsis overflow-hidden',
    'border',
    'focus:border-vega-clight-400 dark:focus:border-vega-cdark-400',
    {
      'bg-vega-clight-700 dark:bg-vega-cdark-700': !disabled && !hasError,
      'bg-transparent': disabled || hasError,
      'border-vega-clight-600 dark:border-vega-cdark-600': disabled,
      'border-vega-red-500': !disabled && hasError,
      'border-vega-clight-500 dark:border-vega-cdark-500':
        !disabled && !hasError,
    }
  );
