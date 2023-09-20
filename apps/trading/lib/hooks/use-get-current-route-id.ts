import { routerConfig } from '../../pages/client-router';
import { matchRoutes, useLocation } from 'react-router-dom';

export const useGetCurrentRouteId = () => {
  const location = useLocation();
  const matches = matchRoutes(routerConfig, location);
  const lastRoute = matches ? matches[matches.length - 1] : undefined;
  if (lastRoute) {
    const id = lastRoute.route.id;
    return id || '';
  }
  return '';
};
