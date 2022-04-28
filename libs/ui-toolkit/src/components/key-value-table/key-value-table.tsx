import classNames from 'classnames';
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
      {title && <h3 className="mt-8 mb-4">{title}</h3>}
      <table
        data-testid="key-value-table"
        {...rest}
        className={`w-full border-collapse mb-8 [border-spacing:0] break-all ${
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
  const trClassName = classNames(
    'flex flex-col sm:table-row border-b first:border-t border-white',
    {
      'border-grey/1 first:[border-top:none] last:[border-bottom:none]': muted,
    },
    className
  );
  const thClassName = `break-word text-left font-medium text-white uppercase align-top p-4`;
  const tdClassName = classNames('align-top p-4 text-right text-grey', {
    'font-mono': numerical,
  });

  return (
    <tr {...rest} className={trClassName}>
      <th className={thClassName}>{children[0]}</th>
      <td className={tdClassName}>{children[1]}</td>
    </tr>
  );
};
