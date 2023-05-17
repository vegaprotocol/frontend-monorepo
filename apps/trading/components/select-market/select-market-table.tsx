import { columnHeaders } from './select-market-columns';
import classNames from 'classnames';
import type { Column } from './select-market-columns';

export const SelectMarketTableHeader = ({
  detailed = false,
  headers = columnHeaders,
}) => {
  return (
    <tr className="sticky top-0 z-10 border-b border-default bg-inherit">
      {headers.map(({ kind, value, className, onlyOnDetailed }) => {
        const thClass = classNames(
          'font-normal text-neutral-500 dark:text-neutral-400',
          className
        );

        if (!onlyOnDetailed || detailed === onlyOnDetailed) {
          return (
            <th key={kind} className={thClass}>
              {value}
            </th>
          );
        }

        return null;
      })}
    </tr>
  );
};

export const SelectMarketTableRow = ({
  detailed = false,
  columns,
  onSelect,
  marketId,
}: {
  detailed?: boolean;
  columns: Column[];
  onSelect: (id: string, metaKey?: boolean) => void;
  marketId: string;
}) => {
  return (
    <tr
      className={`hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer relative h-[34px]`}
      onClick={(ev) => {
        onSelect(marketId, ev.metaKey || ev.ctrlKey);
      }}
      data-testid={`market-link-${marketId}`}
    >
      {columns.map(({ kind, value, className, dataTestId, onlyOnDetailed }) => {
        if (!onlyOnDetailed || detailed === onlyOnDetailed) {
          const tdClass = classNames(className);
          return (
            <td key={kind} data-testid={dataTestId} className={tdClass}>
              {value}
            </td>
          );
        }
        return null;
      })}
    </tr>
  );
};
