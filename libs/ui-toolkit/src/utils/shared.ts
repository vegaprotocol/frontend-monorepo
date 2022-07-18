import classnames from 'classnames';

export const defaultFormElement = (hasError?: boolean) =>
  classnames(
    'flex items-center w-full',
    'box-border',
    'border rounded-none',
    'bg-clip-padding',
    'bg-white dark:bg-white-25',
    'text-black placeholder:text-black-60 dark:text-white dark:placeholder:text-white-60',
    'text-ui',
    'px-8',
    'focus-visible:outline-none',
    'disabled:bg-black-10 disabled:dark:bg-white-10',
    {
      'input-border dark:input-border-dark focus-visible:shadow-input-focus dark:focus-visible:shadow-input-focus-dark':
        !hasError,
      'border-vega-red focus:shadow-input-focus-error dark:focus:shadow-input-focus-error-dark':
        hasError,
    }
  );
