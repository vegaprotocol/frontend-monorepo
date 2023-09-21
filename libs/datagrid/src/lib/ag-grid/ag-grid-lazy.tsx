import { forwardRef } from 'react';
import type { AgGridReactProps, AgGridReact } from 'ag-grid-react';
import { AgGridThemed } from './ag-grid-lazy-themed';

type Props = AgGridReactProps & {
  style?: React.CSSProperties;
  gridRef?: React.Ref<AgGridReact>;
};

export const AgGridLazy = forwardRef<AgGridReact, Props>((props, ref) => (
  <AgGridThemed {...props} gridRef={ref} />
));
