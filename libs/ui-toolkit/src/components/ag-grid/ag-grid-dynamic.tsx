import dynamic from 'next/dynamic';

import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';

// https://stackoverflow.com/questions/69433673/nextjs-reactdomserver-does-not-yet-support-suspense
export const AgGridDynamic = dynamic<
  (AgGridReactProps | AgReactUiProps) & { style: React.CSSProperties }
>(() => import('./ag-grid-themed').then((mod) => mod.AgGridThemed), {
  ssr: false,
  // https://nextjs.org/docs/messages/invalid-dynamic-suspense
  // suspense: true
});
