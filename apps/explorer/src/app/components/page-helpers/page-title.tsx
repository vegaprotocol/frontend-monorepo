import { cn } from '@vegaprotocol/ui-toolkit';
import type { HTMLAttributes, ReactNode } from 'react';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { RouteTitle } from '../route-title';
import { PageActions } from './page-actions';

type PageTitleProps = {
  /**
   * The page title
   * (also sets the document title unless overwritten by
   * `documentTitle` property)
   */
  title: string;
  /**
   * The react node that consists of CTA buttons, links, etc.
   */
  actions?: ReactNode;
  /**
   * Overwrites the document title
   */
  documentTitle?: Parameters<typeof useDocumentTitle>[0];
} & Omit<HTMLAttributes<HTMLHeadingElement>, 'children'>;

export const PageTitle = ({
  title,
  actions,
  documentTitle,
  className,
  ...props
}: PageTitleProps) => {
  useDocumentTitle(
    documentTitle && documentTitle.length > 0 ? documentTitle : [title]
  );
  return (
    <div
      className="flex flex-col md:flex-row gap-1 justify-between content-start mb-8"
      data-testid="page-title"
    >
      <RouteTitle className={cn('mb-1', className)} {...props}>
        {title}
      </RouteTitle>
      {actions && <PageActions>{actions}</PageActions>}
    </div>
  );
};
