import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { FULL_ROUTES } from '../../routes/route-names';
import { ErrorModal } from '../modals/error-modal';
import type { ErrorProperties } from './with-error-store';
import { withErrorStore } from './with-error-store';
import type { RouterProperties } from './with-router';
import { withRouter } from './with-router';

interface Properties extends RouterProperties, ErrorProperties {
  children?: ReactNode;
}

interface State {
  error: Error | null;
}

class GlobalErrorBoundary extends Component<Properties, State> {
  constructor(properties: Properties) {
    super(properties);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error);
  }

  public override render() {
    // This error is caught by the boundary
    const { error } = this.state;
    // This error is reported from backend interactions, which are async
    // and as such not caught by the global error boundary
    const { error: storeError, children } = this.props;
    const error_ = error || storeError;

    if (error_) {
      // If this is a reported error then ensure this component is also aware of it
      if (!error) this.setState({ error: error_ });
      if (!storeError) this.props.setError(error_);
      return (
        <ErrorModal
          error={error_}
          onClose={() => {
            this.setState({ error: null });
            this.props.setError(null);
            this.props.navigate(FULL_ROUTES.wallets);
          }}
        />
      );
    }

    return children;
  }
}

export default withErrorStore(withRouter(GlobalErrorBoundary));
