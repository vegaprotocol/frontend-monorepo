import React from "react";

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

  componentDidCatch(error: Error) {
    console.log(`Error caught in App error boundary ${error.message}`, error);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong</h1>;
    }

    return this.props.children;
  }
}
