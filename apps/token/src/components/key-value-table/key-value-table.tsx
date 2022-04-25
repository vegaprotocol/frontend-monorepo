import "./key-value-table.scss";

import * as React from "react";

export interface KeyValueTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  title?: string;
  numerical?: boolean; // makes all values monospace
  children: React.ReactNode;
  muted?: boolean;
}

export const KeyValueTable = ({
  title,
  numerical,
  children,
  muted,
  className,
  ...rest
}: KeyValueTableProps) => {
  return (
    <React.Fragment>
      {title && <h3 className="key-value-table__header">{title}</h3>}
      <table
        data-testid="key-value-table"
        {...rest}
        className={`key-value-table ${className ? className : ""} ${
          numerical ? "key-value-table--numerical" : ""
        }
        ${muted ? "key-value-table--muted" : ""}`}
      >
        <tbody>{children}</tbody>
      </table>
    </React.Fragment>
  );
};

export interface KeyValueTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
}

export const KeyValueTableRow = ({
  children,
  className,
  ...rest
}: KeyValueTableRowProps) => {
  return (
    <tr
      {...rest}
      className={`key-value-table__row ${className ? className : ""}`}
    >
      {children[0]}
      {children[1]}
    </tr>
  );
};
