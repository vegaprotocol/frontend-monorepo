import classnames from 'classnames';
import { HTMLAttributes } from 'react';

interface SubHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const SubHeading = ({
  children,
  className,
  ...props
}: SubHeadingProps) => {
  const classes = classnames(
    'font-alpha',
    'text-h4',
    'uppercase',
    'mt-12',
    'mb-12',
    className
  );
  return (
    <h2 {...props} className={classes}>
      {children}
    </h2>
  );
};
