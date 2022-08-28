import classnames from 'classnames';

export const defaultFormElement = (hasError?: boolean) =>
  classnames(
    'flex items-center w-full text-sm',
    'p-2 border-2 rounded-none',
    'bg-transparent ',
    'border-[1px] border-neutral-500 focus:border-black dark:focus:border-white',
    'disabled:opacity-40',
    {
      'border-vega-pink': hasError,
    }
  );
