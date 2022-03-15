import React from 'react';
import { StatusMessage } from '../status-message';

interface RenderFetchedProps {
  children: React.ReactNode;
  error: Error | undefined;
  loading: boolean | undefined;
  className?: string;
}

export const RenderFetched = ({
  error,
  loading,
  children,
  className,
}: RenderFetchedProps) => {
  if (loading) {
    return <StatusMessage className={className}>Loading...</StatusMessage>;
  }

  if (error) {
    return <StatusMessage className={className}>Error: {error}</StatusMessage>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
