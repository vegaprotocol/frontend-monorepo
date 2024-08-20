import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

export interface RoundedWrapperProps {
  children?: ReactNode;
  border?: boolean;
  paddingBottom?: boolean;
  marginBottomLarge?: boolean;
  heightFull?: boolean;
  className?: string;
}

export const RoundedWrapper = ({
  children,
  border = true,
  paddingBottom = false,
  marginBottomLarge = false,
  heightFull = false,
  className,
}: RoundedWrapperProps) => (
  <div
    className={cn(
      'rounded-xl pt-4 px-4 overflow-hidden',
      {
        'border border-gs-300 dark:border-gs-700': border,
        'pb-4': paddingBottom,
        'mb-10': marginBottomLarge,
        'mb-4': !marginBottomLarge,
        'h-full': heightFull,
      },
      className
    )}
  >
    {children}
  </div>
);
