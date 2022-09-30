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
    'cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-300':
      props['aria-disabled'] !== true,
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

export const ExternalLink = ({ children, className, ...props }: LinkProps) => (
  <Link
    className={classNames(className, 'inline-flex items-baseline')}
    {...props}
    target="_blank"
    data-testid="external-link"
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
