import classNames from 'classnames';
import type { ReactNode, AnchorHTMLAttributes } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

/**
 * Form an HTML link tag
 */
export const Link = ({ className, children, ...props }: LinkProps) => {
  const anchorClassName = classNames(className, {
    underline: typeof children === 'string',
    'cursor-pointer': props['aria-disabled'] !== true,
    'opacity-50 pointer-events-none': props['aria-disabled'] === true,
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
