import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

type BreadcrumbsProps = {
  elements: (ReactNode | string)[];
};

export const Breadcrumbs = ({
  elements,
  className,
  ...props
}: BreadcrumbsProps & HTMLAttributes<HTMLOListElement>) => {
  const crumbs = elements.map((crumb, i) => (
    <li
      key={i}
      className={classNames(
        'before:content-["/"] before:pr-2 before:text-vega-light-300 dark:before:text-vega-dark-300',
        'overflow-hidden text-ellipsis'
      )}
    >
      {crumb}
    </li>
  ));
  return crumbs.length > 0 ? (
    <ol
      className={classNames(['flex flex-row flex-wrap gap-2'], className)}
      {...props}
    >
      {crumbs}
    </ol>
  ) : null;
};
