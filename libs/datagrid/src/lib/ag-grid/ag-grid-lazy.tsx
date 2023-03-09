import * as React from 'react';
import type { AgGridReact } from 'ag-grid-react';

export const AgGridLazyInternal = React.lazy(() =>
  import('./ag-grid-lazy-themed').then((module) => ({
    default: module.AgGridThemed,
  }))
);

export const AgGridLazy = React.forwardRef<AgGridReact>((props, ref) => (
  <AgGridLazyInternal {...props} ref={ref} />
));
