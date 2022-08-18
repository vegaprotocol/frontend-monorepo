import type { Column } from './select-market-columns';
import { columnHeaders } from './select-market-columns';

export const SelectMarketTableHeader = ({
  detailed = false,
  headers = columnHeaders,
}) => {
  return (
    <tr className="sticky top-[-0.5rem] z-10 dark:bg-black bg-white">
      {headers.map(
        ({ value, className, onlyOnDetailed }, i) =>
          (!onlyOnDetailed || detailed === onlyOnDetailed) && (
            <th key={i} className={className}>
              {value}
            </th>
          )
      )}
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
      {columns.map(
        ({ value, className, dataTestId, onlyOnDetailed }, i) =>
          (!onlyOnDetailed || detailed === onlyOnDetailed) && (
            <td key={i} data-testid={dataTestId} className={className}>
              {value}
            </td>
          )
      )}
    </tr>
  );
};
