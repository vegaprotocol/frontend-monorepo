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
    className={classnames('rounded-xl pt-5 px-5 overflow-hidden', {
      'border border-neutral-700': border,
      'pb-5': paddingBottom,
      'mb-10': marginBottomLarge,
      'mb-6': !marginBottomLarge,
      'h-full': heightFull,
    })}
  >
    {children}
  </div>
);
