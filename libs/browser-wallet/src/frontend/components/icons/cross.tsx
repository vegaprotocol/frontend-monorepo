import { cn } from '@vegaprotocol/utils';

import { className as defaultClassName } from './style';

export function Cross({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn(defaultClassName, className)}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3748 1.37476L1.37478 11.3748L0.625244 10.6252L10.6252 0.625229L11.3748 1.37476Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.37478 0.625229L11.3748 10.6252L10.6252 11.3748L0.625244 1.37476L1.37478 0.625229Z"
        fill="currentColor"
      />
    </svg>
  );
}
