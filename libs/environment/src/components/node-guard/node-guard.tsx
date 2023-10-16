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

  if (loading) {
    // eslint-disable-next-line
    return <>{skeleton}</>;
  }

  // It is possible for nodes to have a functioning datanode, but not return
  // any net params. The app cannot safely function without net params
  const netParamEdges = data?.networkParametersConnection.edges;

  if (error || !netParamEdges || !netParamEdges.length) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{failure}</>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
