import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

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

  return (
    <AsyncRenderer<TData> loading={loading} error={error} data={data}>
      {(data) => children(data)}
    </AsyncRenderer>
  );
};
