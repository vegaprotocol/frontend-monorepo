import classNames from 'classnames';
import * as React from 'react';

export interface KeyValueTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  title?: string;
  children: React.ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  muted?: boolean;
  numerical?: boolean;
}

export const KeyValueTable = ({
  title,
  children,
  className,
  muted,
  numerical,
  headingLevel,
  ...rest
}: KeyValueTableProps) => {
  const TitleTag: keyof JSX.IntrinsicElements = headingLevel
    ? `h${headingLevel}`
    : 'div';
  return (
    <React.Fragment>
      {title && (
        <TitleTag className={`text-h${headingLevel} mt-8 mb-4`}>
          {title}
        </TitleTag>
      )}
      <div
        data-testid="key-value-table"
        {...rest}
        className={`w-full border-collapse mb-8 [border-spacing:0] break-all ${
          className ? className : ''
        }`}
      >
        <div>
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
  muted?: boolean;
  inline?: boolean;
  noBorder?: boolean;
  dtClassName?: string;
  ddClassName?: string;
}

export const KeyValueTableRow = ({
  children,
  className,
  muted,
  numerical,
  inline = true,
  noBorder = false,
  dtClassName,
  ddClassName,
  id,
}: KeyValueTableRowProps) => {
  const dlClassName = classNames(
    'flex gap-1 flex-wrap justify-between ',
    { 'border-b first:border-t border-black dark:border-white': !noBorder },
    { 'flex-col items-start': !inline },
    { 'flex-row items-center': inline },
    {
      'border-black/60 dark:border-white/60 first:[border-top:none] last:[border-bottom:none]':
        muted,
    },
    className
  );
  const dtClassNames = `break-words font-medium uppercase align-top p-4 capitalize ${dtClassName}`;
  const ddClassNames = classNames(
    'align-top p-4 text-black/60 dark:text-white/60 break-words',
    'group-target:text-white dark:group-target:text-black',
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
