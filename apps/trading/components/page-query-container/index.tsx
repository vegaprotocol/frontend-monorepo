import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import classNames from 'classnames';
import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';

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
  const splashClasses = classNames(
    'w-full h-full',
    'flex items-center justify-center'
  );

  if (loading || !data) {
    return <div className={splashClasses}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={splashClasses}>Something went wrong: {error.message}</div>
    );
  }

  return <>{children(data)}</>;
};
