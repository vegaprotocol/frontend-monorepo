import React from 'react';
import { useRoutes } from 'react-router-dom';
import { RouteErrorBoundary } from '../components/router-error-boundary';

import routerConfig from './router-config';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => {
  const routes = useRoutes(routerConfig);

  const splashLoading = (
    <Splash>
      <Loader />
    </Splash>
  );

  return (
    <RouteErrorBoundary>
      <React.Suspense fallback={splashLoading}>{routes}</React.Suspense>
    </RouteErrorBoundary>
  );
};
