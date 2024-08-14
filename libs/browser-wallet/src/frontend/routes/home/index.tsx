import { Navigate } from 'react-router-dom';

import { useGetRedirectPath } from '@/hooks/redirect-path';

export const Home = () => {
  const { loading, path } = useGetRedirectPath();
  return loading || !path ? null : <Navigate to={path} />;
};
