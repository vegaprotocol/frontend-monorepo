import classnames from 'classnames';
import type { ReactNode } from 'react';

export interface RoundedWrapperProps {
  children?: ReactNode;
  paddingBottom?: boolean;
}

export const RoundedWrapper = ({
  children,
  paddingBottom = false,
}: RoundedWrapperProps) => (
  <div
    className={classnames(
      'rounded-xl mb-10 pt-4 px-4 border border-neutral-700',
      {
        'pb-4': paddingBottom,
      }
    )}
  >
    {children}
  </div>
);
