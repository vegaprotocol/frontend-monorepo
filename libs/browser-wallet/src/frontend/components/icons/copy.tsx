import { cn } from '@vegaprotocol/utils';

import locators from '../locators';
import { className as defaultClassName } from './style';

export function Copy({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      data-testid={locators.copyIcon}
      className={cn(defaultClassName, className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.46997 1.47H14.53V11.53H12.5V10.47H13.47V2.53H5.52997V3.5H4.46997V1.47ZM1.46997 4.47H11.53V14.53H1.46997V4.47ZM2.52997 5.53V13.47H10.47V5.53H2.52997Z"
        fill="currentColor"
      />
    </svg>
  );
}
