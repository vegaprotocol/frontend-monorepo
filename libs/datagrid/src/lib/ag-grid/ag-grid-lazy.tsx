import { forwardRef, lazy } from 'react';
import type {
  AgGridReactProps,
  AgReactUiProps,
  AgGridReact,
} from 'ag-grid-react';

type Props = (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  className?: string;
  gridRef?: React.Ref<AgGridReact>;
};

export const AgGridLazyInternal = lazy(() =>
  import('./ag-grid-lazy-themed').then((module) => ({
    default: module.AgGridThemed,
  }))
);

export const AgGridLazy = forwardRef<AgGridReact, Props>((props, ref) => (
  <AgGridLazyInternal {...props} gridRef={ref} />
));
