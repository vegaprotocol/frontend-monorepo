import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { Icon } from '../icon';

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
  // element with our links styles with a react router link compoment
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
    className={classNames(className, 'inline-flex items-baseline')}
    target="_blank"
    data-testid="external-link"
    rel="noreferrer nofollow"
    {...props}
  >
    {typeof children === 'string' ? (
      <>
        <span
          className={classNames({ underline: typeof children === 'string' })}
        >
          {children}
        </span>
        <Icon size={3} name={IconNames.SHARE} className="ml-1" />
      </>
    ) : (
      children
    )}
  </Link>
);
ExternalLink.displayName = 'ExternalLink';
