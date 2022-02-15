import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteErrorBoundary } from '../components/router-error-boundary';

import { SplashLoader } from '../components/splash-loader';
import { SplashScreen } from '../components/splash-screen';
import Home from './home';
import routerConfig from './router-config';

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => {
  const splashLoading = (
    <SplashScreen>
      <SplashLoader />
    </SplashScreen>
  );

  return (
    <RouteErrorBoundary>
      <React.Suspense fallback={splashLoading}>
        <Routes>
          <>
            {routerConfig.map(({ path, component: Component, name }) => (
              <Route key={name} path={path} element={<Component />} />
            ))}
          </>
        </Routes>
      </React.Suspense>
    </RouteErrorBoundary>
  );
};
