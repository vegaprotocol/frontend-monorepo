import type { ReactNode } from 'react';
import classNames from 'classnames';
import { getVariantBackground } from '../../utils/intent';
import { TailwindIntents } from '../../utils/intent';

interface LozengeProps {
  children: ReactNode;
  variant?: TailwindIntents;
  className?: string;
}

const getLozengeClasses = (
  variant: LozengeProps['variant'],
  className?: string
) => {
  return classNames(
    ['rounded-md', 'font-mono', 'leading-none', 'p-4'],
    getVariantBackground(variant),
    className
  );
};

export const Lozenge = ({
  children,
  variant = TailwindIntents.Highlight,
  className,
}: LozengeProps) => {
  return (
    <span className={getLozengeClasses(variant, className)}>{children}</span>
  );
};
