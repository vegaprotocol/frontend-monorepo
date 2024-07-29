import { type HTMLAttributes, type ReactNode } from 'react';

export const Datagrid = ({
  children,
  title,
  ...props
}: HTMLAttributes<HTMLDListElement> & { title?: ReactNode }) => {
  return (
    <section>
      {title && <h3>{title}</h3>}
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
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-mono">{value}</dd>
    </div>
  );
};
