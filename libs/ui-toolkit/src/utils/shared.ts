import classnames from 'classnames';

export const defaultFormElement = (hasError?: boolean) =>
  classnames(
    'flex items-center w-full',
    'box-border',
    'border rounded-none',
    'bg-clip-padding',
    'input-shadow dark:input-shadow-dark',
    'bg-white dark:bg-white-25',
    'text-black placeholder:text-black-60 dark:text-white dark:placeholder:text-white-60',
    'text-ui',
    'px-8',
    'focus-visible:outline-none',
    'disabled:bg-black-10 disabled:dark:bg-white-10',
    {
      'input-border dark:dark-input-border focus-visible:input-shadow-focus dark:focus-visible:input-shadow-focus-dark':
        !hasError,
      'border-vega-red focus:input-shadow-focus-error dark:focus:input-shadow-focus-error-dark':
        hasError,
    }
  );
