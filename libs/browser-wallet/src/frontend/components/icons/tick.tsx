import { cn } from '@vegaprotocol/utils';

import locators from '../locators';
import { className as defaultClassName } from './style';

export function Tick({
  className,
  size,
}: Readonly<{ className?: string; size?: number }>) {
  return (
    <svg
      width={size}
      height={size}
      data-testid={locators.tickIcon}
      viewBox="0 0 16 16"
      className={cn(defaultClassName, className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.00001 11.2505L13.6252 3.62524L14.3748 4.37478L6.00001 12.7495L1.62524 8.37478L2.37478 7.62524L6.00001 11.2505Z"
        fill="currentColor"
      />
    </svg>
  );
}
