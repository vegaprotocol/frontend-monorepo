import * as React from 'react';

export interface KeyValueTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  title?: string;
  children: React.ReactNode;
  muted?: boolean;
  numerical?: boolean;
}

export const KeyValueTable = ({
  title,
  children,
  className,
  muted,
  numerical,
  ...rest
}: KeyValueTableProps) => {
  return (
    <React.Fragment>
      {title && <h3 className="mt-2.5 mb-1.25">{title}</h3>}
      <table
        data-testid="key-value-table"
        {...rest}
        className={`w-full border-collapse mb-2.5 [border-spacing:0] break-all ${
          className ? className : ''
        }`}
      >
        <tbody>
          {children &&
            React.Children.map(
              children,
              (child) =>
                child &&
                React.cloneElement(
                  child as React.ReactElement<KeyValueTableRowProps>,
                  {
                    muted,
                    numerical,
                  }
                )
            )}
        </tbody>
      </table>
    </React.Fragment>
  );
};

export interface KeyValueTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  numerical?: boolean; // makes all values monospace
  muted?: boolean;
}

export const KeyValueTableRow = ({
  children,
  className,
  muted,
  numerical,
  ...rest
}: KeyValueTableRowProps) => {
  return (
    <tr
      {...rest}
      className={`flex flex-col sm:table-row border-b first:border-t border-white ${
        className ? className : ''
      } ${
        muted
          ? 'border-grey/1 first:[border-top:none] last:[border-bottom:none]'
          : ''
      } `}
    >
      <th
        className={`break-word text-left font-medium text-white uppercase align-top p-1`}
      >
        {children[0]}
      </th>
      <td
        className={`align-top p-1 text-right text-grey ${
          numerical ? 'font-mono' : ''
        }`}
      >
        {children[1]}
      </td>
    </tr>
  );
};
