import classnames from 'classnames';
import type { ReactNode } from 'react';

export interface RoundedWrapperProps {
  children?: ReactNode;
  border?: boolean;
  paddingBottom?: boolean;
  marginBottomLarge?: boolean;
  heightFull?: boolean;
}

export const RoundedWrapper = ({
  children,
  border = true,
  paddingBottom = false,
  marginBottomLarge = false,
  heightFull = false,
}: RoundedWrapperProps) => (
  <div
    className={classnames('rounded-xl pt-4 px-4 overflow-hidden', {
      'border border-default': border,
      'pb-4': paddingBottom,
      'mb-10': marginBottomLarge,
      'mb-4': !marginBottomLarge,
      'h-full': heightFull,
    })}
  >
    {children}
  </div>
);
