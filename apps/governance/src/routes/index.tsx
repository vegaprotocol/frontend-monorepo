import { Splash, Loader } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import type { WithTranslation } from 'react-i18next';
import { withTranslation } from 'react-i18next';
import { useRoutes } from 'react-router-dom';

import routerConfig from './router-config';

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

  override componentDidCatch(error: Error) {
    console.error(error);
  }

  override render() {
    if (this.state.hasError) {
      return <h1>{this.props.t('Something went wrong')}</h1>;
    }

    return this.props.children;
  }
}

const BoundaryWithTranslation = withTranslation()(RouteErrorBoundary);

export const AppRouter = () => {
  const routes = useRoutes(routerConfig);

  const splashLoading = (
    <Splash>
      <Loader />
    </Splash>
  );

  return (
    <BoundaryWithTranslation>
      <React.Suspense fallback={splashLoading}>{routes}</React.Suspense>
    </BoundaryWithTranslation>
  );
};
