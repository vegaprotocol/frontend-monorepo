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
        'before:content-["/"] before:pr-2 before:text-gs-300 before:float-left',
        'overflow-hidden text-ellipsis leading-loose'
      )}
    >
      {crumb}
    </li>
  ));
  return crumbs.length > 0 ? (
    <ol
      className={classNames(
        ['flex flex-row flex-wrap gap-2', 'text-sm sm:text-base'],
        className
      )}
      {...props}
    >
      {crumbs}
    </ol>
  ) : null;
};
