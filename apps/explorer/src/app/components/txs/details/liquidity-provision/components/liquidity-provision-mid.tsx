import { TableRow } from '../../../../table';

/**
 * In a LiquidityProvision table, this row is the midpoint. Above our LP orders on the
 * buy side, below are LP orders on the sell side. This component simply divides them.
 *
 * There is no API that can give us the mid price when the order was created, and even
 * if there was it isn't clear that would be appropriate for this centre row. So instead
 * it's a simple divider.
 */
export function LiquidityProvisionMid() {
  return (
    <TableRow modifier="bordered">
      <td colSpan={4} className="text-center bg-white"></td>
    </TableRow>
  );
}
