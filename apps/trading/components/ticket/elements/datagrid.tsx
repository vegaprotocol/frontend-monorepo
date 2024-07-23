import { type HTMLAttributes, type ReactNode } from 'react';

export const Datagrid = (props: HTMLAttributes<HTMLDListElement>) => {
  return <dl {...props} className="flex flex-col gap-1 text-xs" />;
};

export const DatagridRow = ({
  label,
  value,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: ReactNode; value: ReactNode }) => {
  return (
    <div {...props} className="flex justify-between gap-1">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-mono">{value}</dd>
    </div>
  );
};
