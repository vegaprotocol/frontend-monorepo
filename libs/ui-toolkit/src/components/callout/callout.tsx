import React from 'react';
import classNames from 'classnames';

export const Callout = ({
  children,
  title,
  intent = 'help',
  icon,
  headingLevel,
}: {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
  intent?: 'danger' | 'warning' | 'prompt' | 'progress' | 'success' | 'help';
  icon?: React.ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  const className = classNames(
    'shadow-callout',
    'border',
    'border-black',
    'dark:border-white',
    'p-8',
    {
      'shadow-intent-danger': intent === 'danger',
      'shadow-intent-warning': intent === 'warning',
      'shadow-intent-prompt': intent === 'prompt',
      'shadow-intent-black dark:shadow-intent-progress': intent === 'progress',
      'shadow-intent-success': intent === 'success',
      'shadow-intent-help': intent === 'help',
      flex: icon,
    }
  );
  const TitleTag: keyof JSX.IntrinsicElements = headingLevel
    ? `h${headingLevel}`
    : 'div';
  const body = (
    <div className="body-large dark:text-white">
      {title && <TitleTag className="text-h5">{title}</TitleTag>}
      {children}
    </div>
  );
  return (
    <div data-testid="callout" className={className}>
      {icon && <div className="">{icon}</div>}
      {icon ? <div className="grow">{body}</div> : body}
    </div>
  );
};
