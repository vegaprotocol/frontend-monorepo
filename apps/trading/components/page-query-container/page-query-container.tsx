import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import { Splash } from '../splash';

interface PageQueryContainerProps<TData, TVariables> {
  query: DocumentNode;
  options?: QueryHookOptions<TData, TVariables>;
  children: (data: TData) => ReactNode;
}

export const PageQueryContainer = <TData, TVariables = OperationVariables>({
  query,
  options,
  children,
}: PageQueryContainerProps<TData, TVariables>) => {
  const { data, loading, error } = useQuery<TData, TVariables>(query, options);

  if (loading || !data) {
    return <Splash>Loading...</Splash>;
  }

  if (error) {
    return <Splash>Something went wrong: {error.message}</Splash>;
  }

  return <>{children(data)}</>;
};
