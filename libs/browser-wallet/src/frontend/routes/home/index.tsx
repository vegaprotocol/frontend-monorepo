import { Navigate } from 'react-router-dom';

import { useGetRedirectPath } from '@/hooks/redirect-path';
// import { FULL_ROUTES } from '../route-names';
// import { useSentry } from '@/hooks/sentry';

export const Home = () => {
  const { loading, path } = useGetRedirectPath();
  // useSentry();
  // If loading then we do not know where to redirect to yet
  return loading || !path ? null : <Navigate to={path} />
};
