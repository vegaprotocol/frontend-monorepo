import type { OperationVariables, QueryHookOptions } from '@apollo/client';
import { useQuery } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import type { ReactNode } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

interface PageQueryContainerProps<TData, TVariables> {
  query: DocumentNode;
  options?: QueryHookOptions<TData, TVariables>;
  render: (data: TData) => ReactNode;
}

export const PageQueryContainer = <TData, TVariables = OperationVariables>({
  query,
  options,
  render,
}: PageQueryContainerProps<TData, TVariables>) => {
  const { data, loading, error } = useQuery<TData, TVariables>(query, options);

  return (
    <AsyncRenderer<TData>
      loading={loading}
      error={error}
      data={data}
      render={render}
    />
  );
};
