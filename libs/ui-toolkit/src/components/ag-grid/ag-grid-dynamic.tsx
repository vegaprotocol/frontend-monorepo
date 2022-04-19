import * as React from 'react';
import dynamic from 'next/dynamic';

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

// https://stackoverflow.com/questions/69433673/nextjs-reactdomserver-does-not-yet-support-suspense
const AgGridDynamicInternal = dynamic<Props>(
  () => import('./ag-grid-dynamic-themed').then((mod) => mod.AgGridThemed),
  {
    ssr: false,
    // https://nextjs.org/docs/messages/invalid-dynamic-suspense
    // suspense: true
  }
) as React.FunctionComponent<Props>;

export const AgGridDynamic = React.forwardRef<AgGridReact, Props>(
  (props, ref) => <AgGridDynamicInternal {...props} gridRef={ref} />
);
