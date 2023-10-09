import classNames from 'classnames';
import * as React from 'react';

export interface KeyValueTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  title?: string;
  children: React.ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  numerical?: boolean;
  className?: string;
}

export const KeyValueTable = ({
  title,
  children,
  numerical,
  headingLevel,
  className,
  ...rest
}: KeyValueTableProps) => {
  const TitleTag: keyof JSX.IntrinsicElements = headingLevel
    ? `h${headingLevel}`
    : 'div';
  return (
    <React.Fragment>
      {title && <TitleTag className={`text-xl my-2`}>{title}</TitleTag>}
      <div data-testid="key-value-table" {...rest} className={className}>
        <div>
          {children &&
            React.Children.map(
              children,
              (child) =>
                child &&
                React.cloneElement(
                  child as React.ReactElement<KeyValueTableRowProps>,
                  {
                    numerical,
                  }
                )
            )}
        </div>
      </div>
    </React.Fragment>
  );
};

export interface KeyValueTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  numerical?: boolean; // makes all values monospace
  inline?: boolean;
  noBorder?: boolean;
  dtClassName?: string;
  ddClassName?: string;
}

export const KeyValueTableRow = ({
  children,
  className,
  numerical,
  inline = true,
  noBorder = false,
  dtClassName = 'text-sm',
  ddClassName = 'text-sm',
  id,
}: KeyValueTableRowProps) => {
  const dlClassName = classNames(
    'flex gap-1 flex-wrap justify-between py-1 text-sm',
    {
      'border-b border-neutral-300 dark:border-neutral-700': !noBorder,
    },
    { 'flex-col items-start': !inline },
    { 'flex-row items-center': inline },
    className
  );
  const dtClassNames = classNames(
    'break-words',
    dtClassName,
    'text-neutral-500 dark:text-neutral-300'
  );
  const ddClassNames = classNames(
    'break-words',
    {
      'font-mono': numerical,
    },
    ddClassName
  );

  const attributes = {} as Partial<React.HTMLProps<HTMLDListElement>>;
  if (id) {
    attributes.id = id;
  }

  return (
    <dl
      className={dlClassName}
      data-testid="key-value-table-row"
      {...attributes}
    >
      <dt className={dtClassNames}>{children[0]}</dt>
      <dd className={ddClassNames}>{children[1]}</dd>
    </dl>
  );
};
