import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { BORDER_COLOR, GRADIENT } from './constants';

type TableColumnDefinition = {
  displayName?: ReactNode;
  name: string;
  tooltip?: string;
  className?: string;
};

type TableProps = {
  columns: TableColumnDefinition[];
  data: Record<TableColumnDefinition['name'] | 'className', React.ReactNode>[];
  noHeader?: boolean;
  noCollapse?: boolean;
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
      ...props
    },
    ref
  ) => {
    const header = (
      <thead className={classNames({ 'max-md:hidden': !noCollapse })}>
        <tr>
          {columns.map(({ displayName, name, tooltip }) => (
            <th
              key={name}
              col-id={name}
              className={classNames(
                'px-5 py-3 text-sm  text-vega-clight-100 dark:text-vega-cdark-100 font-normal',
                INNER_BORDER_STYLE
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
          'border-separate border rounded-md border-spacing-0',
          BORDER_COLOR,
          GRADIENT,
          className
        )}
        {...props}
      >
        {!noHeader && header}
        <tbody>
          {data.map((d, i) => (
            <tr
              key={i}
              className={classNames(d['className'] as string, {
                'max-md:flex flex-col w-full': !noCollapse,
              })}
            >
              {columns.map(({ name, displayName, className }, j) => (
                <td
                  className={classNames(
                    'px-5 py-3 text-base',
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
                  <span>{d[name]}</span>
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
