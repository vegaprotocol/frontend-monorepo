import dynamic from 'next/dynamic';

import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';

// https://stackoverflow.com/questions/69433673/nextjs-reactdomserver-does-not-yet-support-suspense
export const AgGridDynamic = dynamic<
  (AgGridReactProps | AgReactUiProps) & {
    style?: React.CSSProperties;
    className?: string;
  }
>(() => import('./ag-grid-dynamic-themed').then((mod) => mod.AgGridThemed), {
  ssr: false,
  // https://nextjs.org/docs/messages/invalid-dynamic-suspense
  // suspense: true
});
