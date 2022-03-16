import React from 'react';
import { StatusMessage } from '../status-message';

interface RenderFetchedProps {
  children: React.ReactElement;
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
    return (
      <StatusMessage className={className}>Error retrieving data</StatusMessage>
    );
  }

  return children;
};
