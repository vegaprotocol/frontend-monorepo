import { routerConfig } from '../../pages/client-router';
import { matchRoutes, useLocation } from 'react-router-dom';

export const useGetCurrentRouteId = () => {
  const location = useLocation();
  const currentRoute = matchRoutes(routerConfig, location);
  const lastRoute = currentRoute?.pop();
  if (lastRoute) {
    const {
      route: { id },
    } = lastRoute;
    return id || '';
  }
  return '';
};
