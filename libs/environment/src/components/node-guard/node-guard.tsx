import type { ReactNode } from 'react';
import { useNodeHealth } from '../../hooks';

export const NodeGuard = ({
  children,
  failure,
  skeleton,
}: {
  children: ReactNode;
  failure: ReactNode;
  skeleton: ReactNode;
}) => {
  const { error, loading } = useNodeHealth();
  const nonIdealWrapperClasses =
    'h-full min-h-screen flex items-center justify-center';

  if (loading) {
    return <div className={nonIdealWrapperClasses}>{skeleton}</div>;
  }

  if (error) {
    return <div className={nonIdealWrapperClasses}>{failure}</div>;
  }

  // eslint-disable-next-line
  return <>{children}</>;
};
