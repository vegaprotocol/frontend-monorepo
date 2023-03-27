import type { HTMLAttributes, ReactNode } from 'react';
import { useMatches } from 'react-router-dom';
import { Breadcrumbs } from './breadcrumbs';

type Breadcrumbable = {
  handle: {
    breadcrumb: (data: unknown) => ReactNode | string;
  };
};

export const BreadcrumbsContainer = (
  props: HTMLAttributes<HTMLOListElement>
) => {
  const matches = useMatches();
  const crumbs = matches
    .filter((m) => Boolean((m as Breadcrumbable)?.handle?.breadcrumb))
    .map((m) => (m as Breadcrumbable).handle.breadcrumb(m.params));

  return <Breadcrumbs elements={crumbs} {...props} />;
};
