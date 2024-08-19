import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';
import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

export const BORDER_COLOR = 'border-gs-300 dark:border-gs-700';
export const GRADIENT = 'bg-gradient-to-b from-surface-2 to-transparent';

type TableColumnDefinition = {
  displayName?: ReactNode;
  name: string;
  tooltip?: string;
  className?: string;
  headerClassName?: string;
  testId?: string;
};

type DataEntry = {
  [key: TableColumnDefinition['name']]: ReactNode;
  className?: string;
};

type TableProps = {
  columns: TableColumnDefinition[];
  data: DataEntry[];
  noHeader?: boolean;
  noCollapse?: boolean;
  onRowClick?: (index: number) => void;
};

const INNER_BORDER_STYLE = `border-b ${BORDER_COLOR}`;

export const Table = forwardRef<
  HTMLTableElement,
  TableProps & HTMLAttributes<HTMLTableElement>
>(
  (
    {
      columns,
      data,
      noHeader = false,
      noCollapse = false,
      className,
      onRowClick,
      ...props
    },
    ref
  ) => {
    const header = (
      <thead className={cn({ 'max-md:hidden': !noCollapse })}>
        <tr>
          {columns.map(({ displayName, name, tooltip, headerClassName }) => (
            <th
              key={name}
              col-id={name}
              className={cn(
                'px-5 py-3 text-xs font-normal',
                INNER_BORDER_STYLE,
                headerClassName
              )}
            >
              <span className="flex flex-row items-center gap-2">
                <span>{displayName}</span>
                {tooltip ? (
                  <Tooltip description={tooltip}>
                    <button className="no-underline decoration-transparent w-[12px] h-[12px] inline-flex">
                      <VegaIcon size={12} name={VegaIconNames.INFO} />
                    </button>
                  </Tooltip>
                ) : null}
              </span>
            </th>
          ))}
        </tr>
      </thead>
    );
    return (
      <table
        ref={ref}
        className={cn(
          'w-full',
          'border-separate border rounded-md border-spacing-0 overflow-hidden',
          BORDER_COLOR,
          GRADIENT,
          className
        )}
        {...props}
      >
        {!noHeader && header}
        <tbody>
          {data.map((dataEntry, i) => (
            <tr
              key={i}
              className={cn(dataEntry['className'] as string, {
                'max-md:flex flex-col w-full': !noCollapse,
                // collapsed (mobile) row divider
                'first:border-t-0 max-md:border-t border-gs-300 dark:border-gs-700  first:mt-0 mt-1':
                  !noCollapse,
              })}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(i);
                }
              }}
            >
              {columns.map(({ name, displayName, className, testId }, j) => (
                <td
                  className={cn(
                    'px-5 py-3',
                    {
                      'max-md:flex max-md:flex-col max-md:justify-between':
                        !noCollapse,
                    },
                    INNER_BORDER_STYLE,
                    {
                      'border-none': i === data.length - 1 && noCollapse,
                      'md:border-none': i === data.length - 1,
                      'max-md:border-none':
                        i === data.length - 1 && j === columns.length - 1,
                    },
                    className
                  )}
                  key={`${i}-${name}`}
                >
                  {/** display column name in mobile view */}
                  {!noCollapse && !noHeader && displayName && (
                    <span
                      aria-hidden
                      className="px-0 font-mono text-xs md:hidden text-surface-1-fg "
                    >
                      {displayName}
                    </span>
                  )}
                  <span data-testid={`${testId || name}-${i}`}>
                    {dataEntry[name]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
);
Table.displayName = 'Table';
