import classNames from 'classnames';
import type { Column } from './select-market-columns';
import { columnHeaders } from './select-market-columns';

export const SelectMarketTableHeader = ({
  detailed = false,
  headers = columnHeaders,
  className = '',
}) => {
  return (
    <tr className="z-10 border-b border-neutral-300 dark:border-neutral-700">
      {headers.map(({ value, className, onlyOnDetailed }, i) => {
        const thClass = classNames(
          'font-normal text-neutral-500 dark:text-neutral-400',
          className
        );

        if (!onlyOnDetailed || detailed === onlyOnDetailed) {
          return (
            <th key={i} className={thClass}>
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
}: {
  detailed?: boolean;
  columns: Column[];
}) => {
  return (
    <tr
      className={`hover:bg-black/20 dark:hover:bg-white/20 cursor-pointer relative`}
    >
      {columns.map(({ value, className, dataTestId, onlyOnDetailed }, i) => {
        if (!onlyOnDetailed || detailed === onlyOnDetailed) {
          const tdClass = classNames(className);
          return (
            <td key={i} data-testid={dataTestId} className={tdClass}>
              {value}
            </td>
          );
        }

        return null;
      })}
    </tr>
  );
};
