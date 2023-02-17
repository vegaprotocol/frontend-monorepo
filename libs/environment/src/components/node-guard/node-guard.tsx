import type { ReactNode } from 'react';
import { useStatisticsQuery } from '../../utils/__generated__/Node';

export const NodeGuard = ({
  children,
  failure,
  skeleton,
}: {
  children: ReactNode;
  failure: ReactNode;
  skeleton: ReactNode;
}) => {
  const { error, loading } = useStatisticsQuery();
  const wrapperClasses = 'h-full min-h-screen flex items-center justify-center';

  if (loading) {
    return <div className={wrapperClasses}>{skeleton}</div>;
  }

  if (error) {
    return <div className={wrapperClasses}>{failure}</div>;
  }

  // eslint-disable-next-line
  return <>{children}</>;
};
