import { type HTMLAttributes, type ReactNode } from 'react';

export const Datagrid = ({
  children,
  heading,
  ...props
}: HTMLAttributes<HTMLDListElement> & { heading?: ReactNode }) => {
  return (
    <section className="flex flex-col gap-1">
      {heading && <h3 className="text-xs">{heading}</h3>}
      <dl {...props} className="flex flex-col gap-1 text-xs">
        {children}
      </dl>
    </section>
  );
};

export const DatagridRow = ({
  label,
  value,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: ReactNode; value: ReactNode }) => {
  return (
    <div {...props} className="flex justify-between gap-1">
      <dt className="text-surface-1-fg-muted">{label}</dt>
      <dd className="text-right font-mono">{value}</dd>
    </div>
  );
};
