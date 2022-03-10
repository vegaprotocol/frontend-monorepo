import * as React from 'react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';

const LazyAgGridStyled = React.lazy(() =>
  import('./ag-grid-themed').then((module) => ({
    default: module.AgGridThemed,
  }))
);

export const AgGridLazy = (
  props: (AgGridReactProps | AgReactUiProps) & { style: React.CSSProperties }
) => <LazyAgGridStyled {...props} />;
