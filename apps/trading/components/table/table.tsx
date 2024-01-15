import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

export const BORDER_COLOR = 'border-vega-clight-500 dark:border-vega-cdark-500';
export const GRADIENT =
  'bg-gradient-to-b from-vega-clight-800 dark:from-vega-cdark-800 to-transparent';

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
      <thead className={classNames({ 'max-md:hidden': !noCollapse })}>
        <tr>
          {columns.map(({ displayName, name, tooltip, headerClassName }) => (
            <th
              key={name}
              col-id={name}
              className={classNames(
                'px-5 py-3 text-xs  text-vega-clight-100 dark:text-vega-cdark-100 font-normal',
                INNER_BORDER_STYLE,
                headerClassName
              )}
            >
              <span className="flex flex-row items-center gap-2">
                <span>{displayName}</span>
                {tooltip ? (
                  <Tooltip description={tooltip}>
                    <button className="text-vega-clight-400 dark:text-vega-cdark-400 no-underline decoration-transparent w-[12px] h-[12px] inline-flex">
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
        className={classNames(
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
              className={classNames(dataEntry['className'] as string, {
                'max-md:flex flex-col w-full': !noCollapse,
              })}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(i);
                }
              }}
            >
              {columns.map(({ name, displayName, className, testId }, j) => (
                <td
                  className={classNames(
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
                      className="px-0 font-mono text-xs md:hidden text-vega-clight-100 dark:text-vega-cdark-100"
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
