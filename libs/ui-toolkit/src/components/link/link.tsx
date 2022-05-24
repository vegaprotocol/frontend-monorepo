import classNames from 'classnames';
import type { ReactNode, HTMLAttributes } from 'react';

type LinkProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
}

/**
 * Form an HTML link tag pointing to an appropriate Etherscan page
 */
export const Link = ({
  className,
  href,
  title,
  children,
  ...props
}: LinkProps) => {
  const anchorClassName = classNames(className, 'cursor-pointer', {
    underline: typeof children === 'string',
  });

  return (
    <a
      data-testid="link"
      href={href}
      rel="noreferrer"
      className={anchorClassName}
      {...props}
    >
      {children}
    </a>
  );
};

Link.displayName = 'Link';
