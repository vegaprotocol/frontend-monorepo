import classNames from 'classnames';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';

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
  const shared = {
    role: 'link',
    'data-testid': 'link',
    referrerPolicy: 'strict-origin' as const,
    className: anchorClassName,
  };

  // if no href is passed just render a span, this is so that we can wrap an
  // element with our links styles with a react router link component
  if (!props.href) {
    return (
      <span {...shared} {...props}>
        {children}
      </span>
    );
  }

  return (
    <a {...shared} {...props}>
      {children}
    </a>
  );
};
Link.displayName = 'Link';

export const ExternalLink = ({ children, className, ...props }: LinkProps) => (
  <Link
    className={classNames(
      'inline-flex items-center gap-1 underline-offset-4',
      className
    )}
    target="_blank"
    data-testid="external-link"
    rel="noreferrer nofollow noopener"
    {...props}
  >
    {typeof children === 'string' ? (
      <>
        <span
          className={classNames({ underline: typeof children === 'string' })}
        >
          {children}
        </span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
      </>
    ) : (
      children
    )}
  </Link>
);
ExternalLink.displayName = 'ExternalLink';
