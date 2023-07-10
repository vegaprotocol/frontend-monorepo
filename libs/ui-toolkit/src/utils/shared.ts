import classnames from 'classnames';

export const defaultSelectElement = (hasError?: boolean) =>
  classnames(defaultFormElement(hasError), 'dark:bg-black');

export const defaultFormElement = (hasError?: boolean) =>
  classnames(
    'flex items-center w-full text-sm',
    'p-2 pr-10 border-2 rounded whitespace-nowrap text-ellipsis overflow-hidden',
    'bg-transparent',
    'border',
    'focus:border-vega-light-300 dark:focus:border-vega-dark-300',
    'disabled:opacity-60',
    {
      'border-vega-pink text-vega-pink': hasError,
      'border-vega-light-200 dark:border-vega-dark-200': !hasError,
    }
  );
