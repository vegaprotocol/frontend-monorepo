import classNames from 'classnames';
import type { ReactNode, AnchorHTMLAttributes } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

/**
 * Form an HTML link tag
 */
export const Link = ({ className, children, ...props }: LinkProps) => {
  const anchorClassName = classNames(className, 'cursor-pointer', {
    underline: typeof children === 'string',
  });

  return (
    <a
      role="link"
      data-testid="link"
      referrerPolicy="strict-origin"
      className={anchorClassName}
      {...props}
    >
      {children}
    </a>
  );
};

Link.displayName = 'Link';
