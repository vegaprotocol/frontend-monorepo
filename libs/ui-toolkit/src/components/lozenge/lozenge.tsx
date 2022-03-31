import type { ReactNode } from 'react';
import classNames from 'classnames';
import type { Variant } from '../../utils/intent';
import { getVariantBackground } from '../../utils/intent';

interface LozengeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  details?: string;
}

const getWrapperClasses = (className: LozengeProps['className']) => {
  return classNames('inline-flex items-center gap-4', className);
};

const getLozengeClasses = (variant: LozengeProps['variant']) => {
  return classNames(
    ['rounded-md', 'font-mono', 'leading-none', 'p-4'],
    getVariantBackground(variant)
  );
};

export const Lozenge = ({
  children,
  variant,
  className,
  details,
  ...props
}: LozengeProps) => {
  return (
    <span className={getWrapperClasses(className)} {...props}>
      <span className={getLozengeClasses(variant)}>{children}</span>

      {details && <span>{details}</span>}
    </span>
  );
};
