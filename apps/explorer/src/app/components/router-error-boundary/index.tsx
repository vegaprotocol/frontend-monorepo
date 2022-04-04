import { t } from '@vegaprotocol/react-helpers';
import React from 'react';

interface RouteErrorBoundaryProps {
  children: React.ReactElement;
}

export class RouteErrorBoundary extends React.Component<
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
    console.log(`Error caught in App error boundary ${error.message}`, error);
  }

  override render() {
    if (this.state.hasError) {
      return <h1>{t('Something went wrong')}</h1>;
    }

    return this.props.children;
  }
}
