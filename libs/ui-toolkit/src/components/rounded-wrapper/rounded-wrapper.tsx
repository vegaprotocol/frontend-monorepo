import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface RoundedWrapperProps {
  children?: ReactNode;
  border?: boolean;
  paddingBottom?: boolean;
  marginBottomLarge?: boolean;
  heightFull?: boolean;
  className?: classNames.Argument;
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
    className={classNames(
      'rounded-xl pt-4 px-4 overflow-hidden',
      {
        'border border-gs-400': border,
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
