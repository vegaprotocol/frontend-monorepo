import * as Sentry from "@sentry/react";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Route, Switch } from "react-router-dom";

import { SplashLoader } from "../components/splash-loader";
import { SplashScreen } from "../components/splash-screen";
import routerConfig from "./router-config";

export interface RouteChildProps {
  name: string;
}

interface RouteErrorBoundaryProps extends WithTranslation {
  children: React.ReactElement;
}

class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return <h1>{this.props.t("Something went wrong")}</h1>;
    }

    return this.props.children;
  }
}

const BoundaryWithTranslation = withTranslation()(RouteErrorBoundary);

export const AppRouter = () => {
  const splashLoading = (
    <SplashScreen>
      <SplashLoader />
    </SplashScreen>
  );

  return (
    <BoundaryWithTranslation>
      <React.Suspense fallback={splashLoading}>
        <Switch>
          {routerConfig.map(
            ({ path, component: Component, exact = false, name }) => (
              <Route key={name} path={path} exact={exact}>
                <Component name={name} />
              </Route>
            )
          )}
        </Switch>
      </React.Suspense>
    </BoundaryWithTranslation>
  );
};
