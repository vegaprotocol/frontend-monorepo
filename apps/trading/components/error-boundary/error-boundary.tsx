import { LocalLogger, localLoggerFactory } from '@vegaprotocol/logger';
import { Component, type ErrorInfo, type ReactNode } from 'react';

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

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.logger) {
      this.logger.error(error.message, JSON.stringify(info));
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultFallback />;
    }

    return this.props.children;
  }
}

const DefaultFallback = () => {
  return <p className="text-xs">Something went wrong</p>;
};
