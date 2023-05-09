import type { ReactNode } from 'react';
import { useNodeGuardQuery } from './__generated__/NodeGuard';

export const NodeGuard = ({
  children,
  failure,
  skeleton,
}: {
  children: ReactNode;
  failure: ReactNode;
  skeleton: ReactNode;
}) => {
  const { data, error, loading } = useNodeGuardQuery();
  const wrapperClasses =
    'h-full min-h-screen flex items-center justify-center text-black dark:text-white';

  if (loading) {
    return <div className={wrapperClasses}>{skeleton}</div>;
  }

  // It is possible for nodes to have a functioning datanode, but not return
  // any net params. The app cannot safely function without net params
  const netParamEdges = data?.networkParametersConnection.edges;

  if (error || !netParamEdges || !netParamEdges.length) {
    return <div className={wrapperClasses}>{failure}</div>;
  }

  // eslint-disable-next-line
  return <>{children}</>;
};
