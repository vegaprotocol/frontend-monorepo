import React from 'react';
import { useRoutes } from 'react-router-dom';
import { RouteErrorBoundary } from '../components/router-error-boundary';

import { SplashScreen } from '../components/splash-screen';
import routerConfig from './router-config';
import { Loader } from '@vegaprotocol/ui-toolkit';

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => {
  const routes = useRoutes(routerConfig);

  const splashLoading = (
    <SplashScreen>
      <Loader />
    </SplashScreen>
  );

  return (
    <RouteErrorBoundary>
      <React.Suspense fallback={splashLoading}>{routes}</React.Suspense>
    </RouteErrorBoundary>
  );
};
