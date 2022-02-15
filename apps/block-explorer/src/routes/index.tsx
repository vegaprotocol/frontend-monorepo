import React from "react";
import { Route, Switch } from "react-router-dom";
import { RouteErrorBoundary } from "../components/router-error-boundary";

import { SplashLoader } from "../components/splash-loader";
import { SplashScreen } from "../components/splash-screen";
import routerConfig from "./router-config";

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
        <Switch>
          {routerConfig.map(
            ({ path, component: Component, exact = false, name }) => (
              <Route key={name} path={path} exact={exact}>
                <Component />
              </Route>
            )
          )}
        </Switch>
      </React.Suspense>
    </RouteErrorBoundary>
  );
};
