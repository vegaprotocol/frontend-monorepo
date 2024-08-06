import type { ReactNode } from 'react';

export interface AsyncRendererProperties {
  loading?: boolean;
  renderLoading?: () => ReactNode;
  error?: Error | null;
  errorView?: (error: Error) => ReactNode;
  noData?: boolean;
  renderNoData?: () => ReactNode;
  render: () => ReactNode;
}

export function AsyncRenderer({
  renderLoading,
  errorView,
  renderNoData,
  render,
  error = null,
  loading = false,
  noData = false,
}: Readonly<AsyncRendererProperties>) {
  if (loading) return renderLoading ? <>{renderLoading()}</> : null;
  if (error) return errorView ? <>{errorView(error)}</> : null;
  if (noData) return renderNoData ? <>{renderNoData()}</> : null;
  return <>{render()}</>;
}
