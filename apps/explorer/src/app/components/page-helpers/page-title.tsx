import type { ReactNode } from 'react';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { RouteTitle } from '../route-title';
import { PageActions } from './page-actions';

type PageTitleProps = {
  title: string;
  actions?: ReactNode;
  documentTitle?: string[];
};
export const PageTitle = ({
  title,
  actions,
  documentTitle,
}: PageTitleProps) => {
  useDocumentTitle(
    documentTitle && documentTitle.length > 0 ? documentTitle : [title]
  );
  return (
    <div className="flex flex-col md:flex-row gap-1 justify-between content-start mb-8">
      <RouteTitle className="mb-1" data-testid="page-title">
        {title}
      </RouteTitle>
      {actions && (
        <PageActions data-testid="page-actions">{actions}</PageActions>
      )}
    </div>
  );
};
