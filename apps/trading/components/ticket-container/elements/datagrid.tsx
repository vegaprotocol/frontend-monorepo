import { type HTMLAttributes, type ReactNode } from 'react';

export const Datagrid = (props: HTMLAttributes<HTMLDListElement>) => {
  return <dl {...props} className="grid grid-cols-2 gap-1 text-xs" />;
};

export const DatagridRow = (props: { label: ReactNode; value: ReactNode }) => {
  return (
    <>
      <dt>{props.label}</dt>
      <dd className="text-right font-mono">{props.value}</dd>
    </>
  );
};
