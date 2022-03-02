import { QueryHookOptions, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';

interface PageQueryContainerProps<TData, TVariables> {
  query: DocumentNode;
  options?: QueryHookOptions<TData, TVariables>;
  children: (data: TData) => ReactNode;
}

export const PageQueryContainer = <TData, TVariables>({
  query,
  options,
  children,
}: PageQueryContainerProps<TData, TVariables>) => {
  const { data, loading, error } = useQuery<TData, TVariables>(query, options);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong: {error.message}</div>;
  }

  return <>{children(data)}</>;
};
