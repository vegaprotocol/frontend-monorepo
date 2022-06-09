import classNames from 'classnames';
import { includesLeftPadding, includesRightPadding } from './class-names';

export const inputClassNames = ({
  hasError,
  className,
}: {
  hasError?: boolean;
  className?: string;
}) => {
  return classNames(
    [
      'flex items-center w-full',
      'box-border',
      'border rounded-none',
      'bg-clip-padding',
      'border-black-60 dark:border-white-60',
      'bg-black-25 dark:bg-white-25',
      'text-black placeholder:text-black-60 dark:text-white dark:placeholder:text-white-60',
      'text-ui',
      'focus-visible:shadow-focus dark:focus-visible:shadow-focus-dark',
      'focus-visible:outline-0',
      'disabled:bg-black-10 disabled:dark:bg-white-10',
    ],
    {
      'pl-8': !includesLeftPadding(className),
      'pr-8': !includesRightPadding(className),
      'border-vega-pink dark:border-vega-pink': hasError,
    },
    className
  );
};
