import { LocalLogger, localLoggerFactory } from '@vegaprotocol/logger';
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  logger: LocalLogger | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.logger = localLoggerFactory({ application: props.feature });

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    if (this.logger) {
      this.logger.error(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <Fallback />;
    }

    return this.props.children;
  }
}

const Fallback = () => {
  return <p className="text-xs">Something went wrong</p>;
};
